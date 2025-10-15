import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSIONS_KEY,
  PermissionRequirement,
} from '../decorator/permission.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissionRequirement =
      this.reflector.getAllAndOverride<PermissionRequirement>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!permissionRequirement) {
      return true;
    }

    const { resource, level } = permissionRequirement;
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const hasPermission = await this.checkUserPermission(
      user.id,
      resource,
      level,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions for ${resource} (required level: ${level})`,
      );
    }

    return true;
  }

  private async checkUserPermission(
    userId: number,
    resource: string,
    requiredLevel: number,
  ): Promise<boolean> {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { id: userId },
        include: {
          role: {
            include: {
              rolePermissions: {
                where: {
                  permission: {
                    resource: resource,
                  },
                },
              },
            },
          },
        },
      });

      if (!admin) {
        return false;
      }

      const rolePermission = admin.role?.rolePermissions[0];

      if (!rolePermission) {
        return false;
      }

      return (rolePermission.accessLevel & requiredLevel) === requiredLevel;
    } catch (error) {
      return false;
    }
  }
}
