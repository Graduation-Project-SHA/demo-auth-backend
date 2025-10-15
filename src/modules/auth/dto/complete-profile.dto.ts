// ./src/users/dto/complete-profile.dto.ts

import { Language } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsEnum,
  IsNumber,
  Max,
  Min,
  IsPhoneNumber,
} from 'class-validator';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export class CompleteProfileDto {
  @IsString({ message: 'Name must be a string' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString({ message: 'Name must be a string' })
  username: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

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
}
