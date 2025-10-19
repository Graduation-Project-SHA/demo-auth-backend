import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
  IsDateString,
  IsNumber,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole, Language } from '@prisma/client';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export class SignUpUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/, {
    message:
      'Password must contain at least one uppercase letter and one lowercase letter',
  })
  password: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsString({ message: 'Name must be a string' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString({ message: 'UserName must be a string' })
  username: string;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone?: string;

  @IsOptional()
  @IsEnum(Language, { message: 'Language must be either AR or EN' })
  language?: Language;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Please provide a valid date for date of birth' },
  )
  @Transform(({ value }) => (value ? new Date(value).toISOString() : value))
  dob?: string;

  @IsOptional()
  @IsEnum(Gender, { message: 'Gender must be either MALE or FEMALE' })
  gender?: Gender;

  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== null && value !== ''
      ? parseFloat(value)
      : undefined,
  )
  @IsNumber({}, { message: 'Height must be a number' })
  @Min(50, { message: 'Height must be at least 50 cm' })
  @Max(250, { message: 'Height must be at most 250 cm' })
  height?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== null && value !== ''
      ? parseFloat(value)
      : undefined,
  )
  @IsNumber({}, { message: 'Weight must be a number' })
  @Min(20, { message: 'Weight must be at least 20 kg' })
  @Max(300, { message: 'Weight must be at most 300 kg' })
  weight?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  medicalStatus?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  address?: string;

  @IsOptional()
  @IsString()
  countryId?: string;

  @IsString()
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role: UserRole = UserRole.Patient;
}
