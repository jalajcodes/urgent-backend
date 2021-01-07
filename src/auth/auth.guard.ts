import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from 'src/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const req = gqlContext.req;
    const token = req.signedCookies.token;
    let userDetails;

    if (token) {
      try {
        const result = this.jwtService.verify(token);
        if (typeof result === 'object' && result.hasOwnProperty('id')) {
          userDetails = await this.userService.findById(result['id']);
          // set user on req object
          req.user = userDetails.user;
        }
      } catch (error) {
        throw new Error(error);
      }
    }

    if (userDetails) {
      return true;
    }
    return false;
  }
}
