import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import { CreateAccountInput, CreateAccountOutput } from './dtos/create-account.dto';
import { UpdateProfileInput, UpdateProfileOutput } from './dtos/update-profile.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { cookieOptions } from './users.config';
import { CoreOutput } from 'src/common/dtos/core.dto';

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
  ): Promise<CreateAccountOutput> {
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

  async login({ email, password }: LoginInput, res: Response): Promise<LoginOutput> {
    try {
      const user = await this.usersRespository.findOne(
        { email },
        { select: ['password', 'id'] },
      );
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

  logout(res: Response): CoreOutput {
    try {
      res.clearCookie('token');
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.usersRespository.findOne({ id });
      if (user) {
        return {
          success: true,
          user,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'User Not Found',
      };
    }
  }

  async updateProfile(
    userId: number,
    { email, password, role }: UpdateProfileInput,
  ): Promise<UpdateProfileOutput> {
    try {
      const userProfile = await this.usersRespository.findOne(userId);

      if (email) {
        userProfile.email = email;
      }

      if (password) {
        userProfile.password = password;
      }

      if (role) {
        userProfile.role = role;
      }

      await this.usersRespository.save(userProfile);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }
}
