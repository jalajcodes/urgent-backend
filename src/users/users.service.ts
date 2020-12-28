import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRespository: Repository<User>,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ success: boolean; error?: string }> {
    try {
      const exists = await this.usersRespository.findOne({ email });
      if (exists) {
        return { success: false, error: 'Unable to create account' };
      }
      await this.usersRespository.save(
        this.usersRespository.create({ email, password, role }),
      );
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

  async login({
    email,
    password,
  }: LoginInput): Promise<{ success: boolean; error?: string; token?: string }> {
    try {
      const user = await this.usersRespository.findOne({ email });
      if (!user) return { success: false, error: 'Invalid Credentials' };
      const passwordMatches = await user.checkPassword(password);
      if (!passwordMatches) return { success: false, error: 'Invalid Credentials' };

      return {
        success: true,
        token: 'asasasas',
      };
    } catch (error) {
      return {
        error,
        success: false,
      };
    }
  }
}
