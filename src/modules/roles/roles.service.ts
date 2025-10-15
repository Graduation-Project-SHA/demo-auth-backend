import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  private async validatePermissions(permissionIds: number[]) {
    const permissionsCount = await this.prisma.permission.count({
      where: { id: { in: permissionIds } },
    });
    if (permissionsCount !== permissionIds.length) {
      throw new BadRequestException('One or more permission IDs are invalid');
    }
    return true;
  }

  async create(createRoleDto: CreateRoleDto) {
    const { name, permissions } = createRoleDto;

    const existing = await this.prisma.role.findUnique({ where: { name } });
    if (existing) {
      throw new BadRequestException('Role name already exists');
    }

    await this.validatePermissions(permissions.map((p) => p.permissionId));

    const role = await this.prisma.role.create({
      data: {
        name,

        rolePermissions: {
          create: permissions.map((p) => ({
            permissionId: p.permissionId,
            accessLevel: p.accessLevel,
          })),
        },
      },
    });

    return { message: `Role '${role.name}' created successfully.` };
  }

  async findAll() {
    const roles = await this.prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: {
              select: {
                id: true,
                resource: true,
              },
            },
          },
        },
      },
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      permissions: role.rolePermissions.map((rp) => ({
        permissionId: rp.permission.id,
        resource: rp.permission.resource,
        accessLevel: rp.accessLevel,
      })),
    }));
  }

  async resources() {
    return this.prisma.permission.findMany({
      select: {
        id: true,
        resource: true,
      },
    });
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: {
              select: {
                id: true,
                resource: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new BadRequestException(`Role with ID ${id} not found`);
    }

    return {
      id: role.id,
      name: role.name,
      permissions: role.rolePermissions.map((rp) => ({
        permissionId: rp.permission.id,
        resource: rp.permission.resource,
        accessLevel: rp.accessLevel,
      })),
    };
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const { name, permissions } = updateRoleDto;

    return this.prisma.$transaction(async (tx) => {
      const existingRole = await tx.role.findUnique({ where: { id } });
      if (!existingRole) {
        throw new BadRequestException(`Role with ID ${id} not found`);
      }

      const updatedRole = await tx.role.update({
        where: { id },
        data: { name },
      });

      if (permissions) {
        await this.validatePermissions(permissions.map((p) => p.permissionId));

        await tx.rolePermission.deleteMany({ where: { roleId: id } });

        await tx.rolePermission.createMany({
          data: permissions.map((p) => ({
            roleId: updatedRole.id,
            permissionId: p.permissionId,
            accessLevel: p.accessLevel,
          })),
        });
      }

      return { message: `Role '${updatedRole.name}' updated successfully.` };
    });
  }

  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const existingRole = await tx.role.findUnique({ where: { id } });
      if (!existingRole) {
        throw new BadRequestException(`Role with ID ${id} not found`);
      }

      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      await tx.role.delete({ where: { id } });

      return { message: `Role with ID ${id} deleted successfully` };
    });
  }
}
