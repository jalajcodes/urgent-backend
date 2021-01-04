import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if (req.signedCookies) {
      const token = req.signedCookies.token;
      try {
        const decoded = token ? this.jwtService.verify(token) : '';
        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          req['user'] = { id: decoded['id'] };
        }
      } catch (error) {
        throw new HttpException(error, HttpStatus.FORBIDDEN);
      }
      console.log('JWT Middleware Ran');
    }

    next();
  }
}
