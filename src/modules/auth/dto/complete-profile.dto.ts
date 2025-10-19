import { Transform } from 'class-transformer';
import {
  IsString,
  IsDateString,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class CompleteProfileDto {
  @IsString({ message: 'Name must be a string' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString({ message: 'Username must be a string' })
  username: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Please provide a valid date for date of birth' },
  )
  @Transform(({ value }) => (value ? new Date(value).toISOString() : value))
  dob?: string;

  @IsOptional()
  @IsString({ message: 'Gender must be a string' })
  gender?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  address?: string;
}
