import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
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
}
