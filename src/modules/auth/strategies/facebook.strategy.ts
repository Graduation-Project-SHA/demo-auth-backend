// ./src/auth/strategies/facebook.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook-token';
import { ConfigService } from '@nestjs/config';
import { UsersAuthService } from '../services/users.auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersAuthService: UsersAuthService,
  ) {
    super({
      clientID: configService.get<string>('auth.facebook .appId'),
      clientSecret: configService.get<string>('auth.facebook.appSecret'),
      fbGraphVersion: 'v3.0',
    });
  }

  async validate(
    profile: any,
  ): Promise<any> {
    try {
      const { user, isNewUser } =
        await this.usersAuthService.findOrCreateFacebookUser(profile);

      return { ...user, isNewUser };
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
