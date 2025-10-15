import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(
    payload: Record<string, any>,
    expiresIn: string,
    secretKey: string,
  ): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      expiresIn,
      secret: secretKey,
    });
  }

  async verifyToken(
    token: string,
    secretKey: string,
  ): Promise<Record<string, any>> {
    try {
      return await this.jwtService.verifyAsync(token, { secret: secretKey });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
