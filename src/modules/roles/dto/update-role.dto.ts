import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';

export class UpdateRolePermissionDto {
  @IsInt()
  permissionId: number;

  @IsInt()
  @Min(0)
  @Max(7)
  accessLevel: number;
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateRolePermissionDto)
  permissions?: UpdateRolePermissionDto[];
}
