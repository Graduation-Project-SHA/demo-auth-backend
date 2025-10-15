import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { TokenService } from 'src/common/services/token.service';
import { AdminsService } from 'src/modules/admins/admins.service';
import { UserType } from '../dto/local-login.dto';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UsersService,
    private readonly ConfigService: ConfigService,
    private readonly AdminService: AdminsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,

      secretOrKeyProvider: (request, rawJwtToken, done) => {
        let type = request.originalUrl.split('/').filter(Boolean)[0];
        if (type !== 'admin') {
          type = UserType.USER;
        }

        const secretKey = this.ConfigService.get<string>(
          `auth.${type}.refreshTokenSecret`,
        );

        if (!secretKey) {
          throw new UnauthorizedException('Access is denied');
        }

        return done(null, secretKey);
      },
    });
  }

  async validate(request: Request, payload: any): Promise<any> {
    const token = request.get('Authorization')?.split(' ')[1] as string;
    let type = request.originalUrl.split('/').filter(Boolean)[0];
    if (type !== 'admin') {
      type = UserType.USER;
    }

    if (!token) {
      throw new UnauthorizedException('Access is denied');
    }

    switch (type) {
      case UserType.ADMIN:
        if (
          !(await this.AdminService.validateRefreshToken(payload.id, token))
        ) {
          throw new UnauthorizedException('Access is denied');
        }
        break;
      case UserType.USER:
        if (!(await this.userService.validateRefreshToken(payload.id, token))) {
          throw new UnauthorizedException('Access is denied');
        }
        break;
      default:
        throw new UnauthorizedException('Invalid user type');
    }

    return payload;
  }
}
