import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { TokenService } from '../services/token.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    WsJwtGuard.validateToken(client, this.tokenService, this.configService);
    return true;
  }

  private static extractTokenFromHandshake(client: Socket): string | null {
    const token =
      client.handshake.auth?.token || client.handshake.headers?.authorization;
    console.log(token);

    if (!token) return null;

    if (token.startsWith('Bearer ')) {
      return token.substring(7);
    }

    return token;
  }

  static validateToken(client: Socket, tokenService: TokenService, configService: ConfigService) {
  const token =
    client.handshake.auth?.token || client.handshake.headers?.authorization;

  if (!token) {
    throw new WsException('Missing or invalid token');
  }

  const tokenValue = token.startsWith('Bearer ') ? token.substring(7) : token;

  try {
    const secret = configService.get<string>('auth.user.jwtSecret');
    const tokenPayload = tokenService.verifyToken(tokenValue, secret!);

    if (!tokenPayload) {
      throw new WsException('Invalid token');
    }

    client.data.user = tokenPayload;
    return tokenPayload;
  } catch (err) {
    throw new WsException('Token verification failed');
  }
}
}
