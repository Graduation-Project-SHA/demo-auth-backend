import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsInt,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateAdminDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsInt()
  roleId: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
