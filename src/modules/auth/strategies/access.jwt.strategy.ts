import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { TokenService } from 'src/common/services/token.service';
import { UserType } from '../dto/local-login.dto';

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(
    private readonly tokenService: TokenService,
    private readonly ConfigService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (request, rawJwtToken, done) => {
        let type = request.originalUrl.split('/').filter(Boolean)[0];
        if (type !== 'admin') {
          type = UserType.USER;
        }

        const secretKey = this.ConfigService.get<string>(
          `auth.${type}.jwtSecret`,
        );
        if (!secretKey) {
          throw new UnauthorizedException('access is dedined');
        }
        done(null, secretKey);
      },
    });
  }

  async validate(payload: any): Promise<any> {
    return payload;
  }
}
