import { Inject, Injectable } from '@nestjs/common';
import { JwtModuleOptions } from './jwt.interfaces';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { CONFIG_OPTIONS } from 'src/common/common.constants';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
    private readonly config: ConfigService,
  ) {}

  sign(userId: number): string {
    return jwt.sign({ id: userId }, this.options.privateKey, {
      expiresIn: this.config.get('JWT_EXPIRY'),
    });
  }

  verify(token: string) {
    return jwt.verify(token, this.options.privateKey);
  }
}
