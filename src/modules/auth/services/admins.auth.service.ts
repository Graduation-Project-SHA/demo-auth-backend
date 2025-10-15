import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminsService } from 'src/modules/admins/admins.service';
import * as bcrypt from 'bcrypt';
import { TokenService } from 'src/common/services/token.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminAuthSevice {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly TokenService: TokenService,
    private readonly ConfigService: ConfigService,
  ) {}

  private getJwtConfig() {
    const jwtExpiration = this.ConfigService.get<string>(
      'auth.admin.jwtExpirationTime',
    );
    const jwtSecret = this.ConfigService.get<string>('auth.admin.jwtSecret');
    const refreshExpiration = this.ConfigService.get<string>(
      'auth.admin.refreshTokenExpirationTime',
    );
    const refreshSecret = this.ConfigService.get<string>(
      'auth.admin.refreshTokenSecret',
    );
    if (!jwtExpiration || !jwtSecret || !refreshExpiration || !refreshSecret) {
      throw new Error(
        'Authentication configuration is missing from environment variables',
      );
    }
    return { jwtExpiration, jwtSecret, refreshExpiration, refreshSecret };
  }

  async validateAdmin(email: string, password: string) {
    const admin = await this.adminsService.findByEmail(email);

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!(await bcrypt.compare(password, admin.password))) {
      throw new UnauthorizedException('Access denied');
    }
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      isActive: admin.isActive,
      role: admin.role.name,
    };
  }

  async genrateAdminTokens(user: any) {
    const payload = {
      id: user.id,
      email: user.email,
    };

    const { jwtExpiration, jwtSecret, refreshExpiration, refreshSecret } =
      this.getJwtConfig();

    const accessToken = await this.TokenService.generateToken(
      payload,
      jwtExpiration,
      jwtSecret,
    );
    const refreshToken = await this.TokenService.generateToken(
      payload,
      refreshExpiration,
      refreshSecret,
    );

    await this.adminsService.updateRefreshToken(user.id, refreshToken);

    return {
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async removeRefreshToken(userId: number) {
    await this.adminsService.updateRefreshToken(userId, null);
    return {
      massage: 'logout successfully',
    };
  }
}
