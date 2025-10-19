import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import * as bcrypt from 'bcrypt';
import { SignUpUserDto } from '../auth/dto/sign-up-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly userSelectFields = {
    id: true,
    email: true,
    username: true,
    name: true,
    phone: true,
    role: true,
    language: true,
    dob: true,
    gender: true,
    height: true,
    weight: true,
    medicalStatus: true,
    address: true,
    profileImage: true,
    countryId: true,
    country: {
      select: {
        id: true,
        name: true,
        code: true,
      },
    },
    createdAt: true,
    updatedAt: true,
  };

  private readonly userSelectForProfile = {
    id: true,
    email: true,
    username: true,
    name: true,
    phone: true,
    role: true,
    language: true,
    dob: true,
    gender: true,
    height: true,
    weight: true,
    medicalStatus: true,
    address: true,
    profileImage: true,
    country: {
      select: {
        id: true,
        name: true,
        code: true,
      },
    },
    createdAt: true,
    updatedAt: true,
  };

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        emailResetCode: true,
        emailResetCodeExpiresAt: true,
        password: true,
        role: true,
      },
    });
  }

  async createUser(
    data: SignUpUserDto,
    status: UserStatus = 'PENDING_COMPLETION',
  ) {
    const { email, password, countryId, username, ...otherData } = data;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const existingUserName = await this.prisma.user.findUnique({
      where: { username: username },
      select: { id: true },
    });
    if (existingUserName) {
      throw new BadRequestException('Username is already taken');
    }

    if (countryId) {
      const country = await this.prisma.country.findUnique({
        where: { id: countryId },
        select: { id: true },
      });

      if (!country) {
        throw new BadRequestException('Country not found');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        username: username,
        password: hashedPassword,
        countryId,
        status,
        ...otherData,
      },
      select: this.userSelectFields,
    });

    return {
      message: 'User created successfully',
      data: user,
    };
  }

  async findAll(query: UserQueryDto) {
    const {
      search,
      role,
      language,
      countryId,
      page = 1,
      limit = 10,
      sortBy = 'desc' as const,
      sortField = 'createdAt',
    } = query;

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (language) {
      where.language = language;
    }

    if (countryId) {
      where.countryId = countryId;
    }

    const skip = (page - 1) * limit;
    const orderBy = { [sortField]: sortBy };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: this.userSelectFields,
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: this.userSelectFields,
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return {
      data: user,
    };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    status: UserStatus = UserStatus.ACTIVE,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: { id: true, countryId: true },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    if (updateUserDto.username) {
      const existingUserName = await this.prisma.user.findUnique({
        where: { username: updateUserDto.name },
        select: { id: true },
      });
      if (existingUserName) {
        throw new BadRequestException('Username is already taken');
      }
    }

    if (updateUserDto.countryId) {
      const country = await this.prisma.country.findUnique({
        where: { id: updateUserDto.countryId },
        select: { id: true },
      });

      if (!country) {
        throw new BadRequestException('Country not found');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: { ...updateUserDto, status: status },
      select: this.userSelectFields,
    });

    return {
      message: 'User updated successfully',
      data: user,
    };
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto) {
    const { currentPassword, newPassword } = updatePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password!,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password!);
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedNewPassword },
    });

    return {
      message: 'Password updated successfully',
    };
  }

  async remove(id: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: { id: true, name: true, email: true },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),

        refreshToken: null,
      },
    });

    return {
      message: `User "${existingUser.name}" has been deleted successfully`,
    };
  }

  async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: this.userSelectForProfile,
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return {
      data: user,
    };
  }

  async updateProfile(id: string, updateUserDto: UpdateUserDto) {
    return this.update(id, updateUserDto);
  }

  async updateRefreshToken(id: string, refreshToken: string | null) {
    const hashedRefreshToken = refreshToken
      ? await bcrypt.hash(refreshToken, 10)
      : null;

    await this.prisma.user.update({
      where: { id },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  async validateRefreshToken(
    id: string,
    refreshToken: string,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        refreshToken: true,
      },
    });

    if (!user || !user.refreshToken) {
      return false;
    }

    return await bcrypt.compare(refreshToken, user.refreshToken);
  }
 

  async deactivateUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: { id: true, name: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    await this.prisma.user.update({
      where: { id },
      data: { refreshToken: null },
    });

    return {
      message: `User "${user.name}" has been deactivated successfully`,
    };
  }
}
