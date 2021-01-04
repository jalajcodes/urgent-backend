import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { cookieOptions } from './users.config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRespository: Repository<User>,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async createAccount(
    { email, password, role }: CreateAccountInput,
    res: Response,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const exists = await this.usersRespository.findOne({ email });
      if (exists) {
        return { success: false, error: 'Unable to create account' };
      }
      const user = await this.usersRespository.save(
        this.usersRespository.create({ email, password, role }),
      );
      const token = this.jwt.sign(user.id);
      res.cookie('token', token, cookieOptions);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Something went wrong while creating your account.',
      };
    }
  }

  async login(
    { email, password }: LoginInput,
    res: Response,
  ): Promise<{ success: boolean; error?: string; token?: string }> {
    try {
      const user = await this.usersRespository.findOne({ email });
      if (!user) return { success: false, error: 'Invalid Credentials' };
      const passwordMatches = await user.checkPassword(password);
      if (!passwordMatches) return { success: false, error: 'Invalid Credentials' };
      const token = this.jwt.sign(user.id);
      res.cookie('token', token, cookieOptions);
      return {
        success: true,
        // todo: refactor this token implementation into X-CSRF token
        token,
      };
    } catch (error) {
      return {
        error,
        success: false,
      };
    }
  }

  async findById(id: number): Promise<User> {
    console.log('db queried');

    return this.usersRespository.findOne({ id });
  }
}
