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
import { CoreOutput } from 'src/common/dtos/core.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';

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
    return this.usersService.findById(userProfileInput.id);
  }

  @Mutation(returns => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
    @Context() { res },
  ): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput, res);
  }

  @Mutation(returns => LoginOutput)
  async login(
    @Args('input') loginInput: LoginInput,
    @Context() { res },
  ): Promise<LoginOutput> {
    return this.usersService.login(loginInput, res);
  }

  @Mutation(returns => CoreOutput)
  logout(@Context() { res }): CoreOutput {
    return this.usersService.logout(res);
  }

  @Mutation(returns => UpdateProfileOutput)
  @UseGuards(AuthGuard)
  async updateProfile(
    @AuthUser() loggedInUser: User,
    @Args('input') updateProfileInput: UpdateProfileInput,
  ): Promise<UpdateProfileOutput> {
    return this.usersService.updateProfile(loggedInUser.id, updateProfileInput);
  }

  @Mutation(returns => VerifyEmailOutput)
  verify(@Args('input') {code}: VerifyEmailInput): Promise<VerifyEmailOutput> {
    return this.usersService.verifyEmail(code);
  }
}
