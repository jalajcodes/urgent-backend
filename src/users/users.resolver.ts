import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CreateAccountInput, CreateAccountOutput } from './dtos/create-account.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(of => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(returns => Boolean)
  me() {
    return true;
  }

  @Mutation(returns => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      const { success, error } = await this.usersService.createAccount(
        createAccountInput,
      );
      return { success, error };
    } catch (error) {
      return { error, success: false };
    }
  }
}
