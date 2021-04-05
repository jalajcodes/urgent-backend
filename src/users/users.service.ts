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
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifRepository: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount(
    { email, password, role }: CreateAccountInput,
    res,
  ): Promise<CreateAccountOutput> {
    try {
      const exists = await this.usersRepository.findOne({ email });
      if (exists) {
        return { success: false, error: 'Unable to create account' };
      }
      const user = await this.usersRepository.save(
        this.usersRepository.create({ email, password, role }),
      );
      // create verification code
      const verification = await this.verifRepository.save(
        this.verifRepository.create({
          user,
        }),
      );
      // send verification email
      this.mailService.sendVerificationEmail(user.email, verification.code);
      // create token
      const token = this.jwtService.sign(user.id);
      // send token via cookie
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

  async login({ email, password }: LoginInput, res): Promise<LoginOutput> {
    try {
      const user = await this.usersRepository.findOne(
        { email },
        { select: ['password', 'id'] },
      );
      if (!user) return { success: false, error: 'Invalid Credentials' };
      const passwordMatches = await user.checkPassword(password);
      if (!passwordMatches) return { success: false, error: 'Invalid Credentials' };
      const token = this.jwtService.sign(user.id);
      res.cookie('token', token, cookieOptions);
      return {
        success: true,
        // todo: refactor this token implementation into X-CSRF token
        token,
      };
    } catch (error) {
      return {
        error: "Can't log user in.",
        success: false,
      };
    }
  }

  logout(res): CoreOutput {
    res.clearCookie('token');
    return {
      success: true,
    };
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.usersRepository.findOneOrFail({ id });
      return {
        success: true,
        user,
      };
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
      const user = await this.usersRepository.findOne(userId);

      if (email) {
        user.email = email;
        // reset verified status, because user changed email
        user.verified = false;
        // create verification code
        const verification = await this.verifRepository.save(
          this.verifRepository.create({ user }),
        );
        // send verification code in email
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }

      if (password) {
        user.password = password;
      }

      if (role) {
        user.role = role;
      }

      await this.usersRepository.save(user);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Unable to update profile',
      };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifRepository.findOne(
        { code },
        { relations: ['user'] },
      );
      if (verification) {
        verification.user.verified = true;
        await this.usersRepository.save(verification.user);
        await this.verifRepository.delete(verification.id);
        return { success: true };
      }
      return { success: false, error: 'Verification not found.' };
    } catch (error) {
      return {
        success: false,
        error: 'Could not verify email.',
      };
    }
  }
}
