import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UsersService) {}
  async canActivate(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context).getContext();

    const user = gqlContext.req.user;
    // if user exists on request object (set by jwt middleware) then fetch the userDetails from the DB
    const userDetails = user
      ? await this.userService.findById(user.id)
      : 'Please Login First';

    // modify the request object to include the detailed user
    gqlContext.req.user = userDetails; // ugly ugly!!!!!

    if (!user) {
      return false;
    }
    return true;
  }
}
