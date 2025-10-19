// src/modules/countries/dto/create-country.dto.ts
import { IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCountryDto {
  @IsString({ message: 'Country code must be a string' })
  @Length(2, 3, { message: 'Country code must be 2-3 characters' })
  @Matches(/^[A-Z]+$/, {
    message: 'Country code must contain only uppercase letters',
  })
  @Transform(({ value }) => value?.toUpperCase()?.trim())
  code: string;

  @IsString({ message: 'Country name must be a string' })
  @Transform(({ value }) => value?.trim())
  name: string;
}
