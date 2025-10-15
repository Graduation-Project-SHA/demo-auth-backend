import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { UserType } from '../dto/local-login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly AuthService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, email: string, password: string) {
    const pathSegments = req.originalUrl.split('/').filter(Boolean);

    let type = pathSegments[0] as UserType;
    if (type !== 'admin') {
      type = UserType.USER;
    }

    const user = await this.AuthService.localvalidate(email, password, type);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
