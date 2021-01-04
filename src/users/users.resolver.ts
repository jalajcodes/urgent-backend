import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, CONTEXT, Context } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateAccountInput, CreateAccountOutput } from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
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
}
