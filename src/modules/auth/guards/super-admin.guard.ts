import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id: user.id },
      include: {
        role: true,
      },
    });

    if (!admin || admin.role.name !== 'super-admin') {
      throw new ForbiddenException('Only super-admin can perform this action');
    }

    return true;
  }
}
