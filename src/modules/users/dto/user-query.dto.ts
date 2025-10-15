// filepath: /home/ali-hassan/Desktop/work/mostaql/Sport_App_Web/back-end/src/modules/users/dto/user-query.dto.ts
import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UserRole, Language } from '@prisma/client';

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class UserQueryDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @IsOptional()
  @IsString()
  countryId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(SortOrder)
  sortBy?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsString()
  sortField?: string = 'createdAt';
}
