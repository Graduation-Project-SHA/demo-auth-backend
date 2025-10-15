import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';

export class CreateRolePermissionDto {
  @IsInt()
  permissionId: number;

  @IsInt()
  @Min(0)
  @Max(7)
  accessLevel: number;
}

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRolePermissionDto)
  permissions: CreateRolePermissionDto[];
}
