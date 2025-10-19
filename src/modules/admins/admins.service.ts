import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AdminQueryDto } from './dto/admin-query.dto';

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  private getAdminSelectFields() {
    return {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      role: {
        select: {
          name: true,
        },
      },
    };
  }

  private async findAdminById(id: number, includePassword = false) {
    const selectFields = includePassword
      ? { ...this.getAdminSelectFields(), password: true }
      : this.getAdminSelectFields();

    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: selectFields,
    });

    if (!admin) {
      throw new NotFoundException(`Admin with id ${id} not found`);
    }
    return admin;
  }

  private async checkEmailExists(email: string, excludeId?: number) {
    const whereClause: any = { email };
    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const existing = await this.prisma.admin.findUnique({ where: whereClause });
    if (existing) {
      throw new BadRequestException('Email is already in use');
    }
  }

  private async validateRole(roleId: number) {
    const roleExists = await this.prisma.role.findUnique({
      where: { id: roleId },
    });
    if (!roleExists) {
      throw new NotFoundException(`Role with id ${roleId} not found`);
    }
  }

  async create(createAdminDto: CreateAdminDto) {
    const { name, email, password, roleId, isActive } = createAdminDto;

    await this.checkEmailExists(email);
    await this.validateRole(roleId);

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await this.prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isActive,
        role: {
          connect: { id: roleId },
        },
      },
      select: this.getAdminSelectFields(),
    });
    return admin;
  }

  async findAll(adminQueryDto: AdminQueryDto) {
    const {
      search,
      role,
      page = 1,
      limit = 10,
      sortBy = 'DESC',
      sortField = 'createdAt',
    } = adminQueryDto;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = { name: role };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.admin.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortBy },
        select: this.getAdminSelectFields(),
      }),
      this.prisma.admin.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: skip + limit < total,
      hasPreviousPage: skip > 0,
      currentPage: page,
    };
  }

  async findOne(id: number) {
    return this.findAdminById(id);
  }

  async findByEmail(email: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { email },
      select: {
        ...this.getAdminSelectFields(),
        password: true,
      },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with email ${email} not found`);
    }
    return admin;
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    const { name, email, password, roleId, isActive } = updateAdminDto;

    await this.findAdminById(id);

    if (email) {
      await this.checkEmailExists(email, id);
    }

    if (roleId) {
      await this.validateRole(roleId);
    }

    const updateData: any = {
      name,
      email,
      isActive,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (roleId) {
      updateData.role = { connect: { id: roleId } };
    }

    const admin = await this.prisma.admin.update({
      where: { id },
      data: updateData,
      select: this.getAdminSelectFields(),
    });

    return admin;
  }

  async updateRefreshToken(id: number, refreshToken: string | null) {
    const hashedRefreshToken = refreshToken
      ? await bcrypt.hash(refreshToken, 10)
      : null;

    await this.prisma.admin.update({
      where: { id },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  async validateRefreshToken(
    id: number,
    refreshToken: string,
  ): Promise<boolean> {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        refreshToken: true,
        isActive: true,
      },
    });

    if (!admin || !admin.refreshToken) {
      return false;
    }

    return await bcrypt.compare(refreshToken, admin.refreshToken);
  }

  async getMyProfile(adminId: number) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            rolePermissions: {
              select: {
                accessLevel: true,
                permission: {
                  select: {
                    resource: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin profile not found');
    }

    // Format permissions for easier use
    const permissions = admin.role.rolePermissions.map((rp) => ({
      resource: rp.permission.resource,
      accessLevel: rp.accessLevel,
    }));

    return {
      message: 'Admin profile retrieved successfully',
      data: {
        ...admin,
        role: {
          id: admin.role.id,
          name: admin.role.name,
          permissions,
        },
      },
    };
  }

  async updateMyProfile(
    adminId: number,
    updateData: { name?: string; email?: string; password?: string },
  ) {
    const { name, email, password } = updateData;

    // Check if admin exists
    await this.findAdminById(adminId);

    // Check email uniqueness if provided
    if (email) {
      await this.checkEmailExists(email, adminId);
    }

    const updateFields: any = {};

    if (name) {
      updateFields.name = name;
    }

    if (email) {
      updateFields.email = email;
    }

    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    const updatedAdmin = await this.prisma.admin.update({
      where: { id: adminId },
      data: updateFields,
      select: this.getAdminSelectFields(),
    });

    return {
      message: 'Profile updated successfully',
      data: updatedAdmin,
    };
  }

  
  async remove(id: number) {
    await this.findAdminById(id);

    await this.prisma.admin.delete({
      where: { id },
    });

    return {
      message: `Admin with id ${id} has been deleted successfully`,
    };
  }
}
