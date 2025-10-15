import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AdminsService } from 'src/modules/admins/admins.service';
import { UserType } from '../dto/local-login.dto';

@Injectable()
export class IsActiveGuard implements CanActivate {
  constructor(private readonly adminsService: AdminsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.user || !request.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    let type = request.originalUrl.split('/').filter(Boolean)[0];
    if (type !== 'admin') {
      type = UserType.USER;
    }
    let user;

    try {
      switch (type) {
        case 'admin':
          user = await this.adminsService.findOne(request.user.id);
          break;
        case 'user':
          // user = await this.usersService.findOne(request.user.id);
          return true;
        default:
          throw new ForbiddenException('Invalid user type');
      }

      if (!user) {
        throw new ForbiddenException('User not found');
      }

      if (!user.isActive) {
        throw new ForbiddenException('User account is inactive');
      }

      return true;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new ForbiddenException('Access denied');
    }
  }
}
