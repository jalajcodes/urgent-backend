import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    if (!userDetails) throw new NotFoundException('User Not Found Error');
    /* modify the request object to include the detailed user
     *
     * this has to do until I figure out a good way to make userDetails available on request object (using interceptors maybe)
     */
    gqlContext.req.user = userDetails;

    if (!user) {
      return false;
    }
    return true;
  }
}
