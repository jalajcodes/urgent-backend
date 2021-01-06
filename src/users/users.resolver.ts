import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateAccountInput, CreateAccountOutput } from './dtos/create-account.dto';
import { UpdateProfileInput, UpdateProfileOutput } from './dtos/update-profile.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(of => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(returns => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() loggedinUser: User) {
    return loggedinUser;
  }

  @Query(returns => UserProfileOutput)
  @UseGuards(AuthGuard)
  async userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    try {
      const user = await this.usersService.findById(userProfileInput.id);
      if (!user) {
        throw Error();
      }
      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error: 'User not found',
      };
    }
  }

  @Mutation(returns => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
    @Context() { res },
  ): Promise<CreateAccountOutput> {
    try {
      return this.usersService.createAccount(createAccountInput, res);
    } catch (error) {
      return { error, success: false };
    }
  }

  @Mutation(returns => LoginOutput)
  async login(
    @Args('input') loginInput: LoginInput,
    @Context() { res },
  ): Promise<LoginOutput> {
    return this.usersService.login(loginInput, res);
  }

  @Mutation(returns => UpdateProfileOutput)
  @UseGuards(AuthGuard)
  async updateProfile(
    @AuthUser() loggedInUser: User,
    @Args('input') updateProfileInput: UpdateProfileInput,
  ): Promise<UpdateProfileOutput> {
    try {
      await this.usersService.updateProfile(loggedInUser.id, updateProfileInput);
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
