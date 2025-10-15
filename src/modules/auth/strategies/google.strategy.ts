// ./src/auth/strategies/google.strategy.ts

import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-id-token';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { UsersAuthService } from '../services/users.auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersAuthService: UsersAuthService,
  ) {
    const clientID = configService.get<string>('auth.google.clientID');
    super({
      clientID,
    });
  }

  async validate(parsedToken: any, googleId: string) {
    try {
      const payload = parsedToken.payload;
      payload.googleId = googleId;

      const { user, isNewUser } =
        await this.usersAuthService.findOrCreateGoogleUser(payload);

      return { ...user, isNewUser };
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
