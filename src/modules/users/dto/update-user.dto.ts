import { PartialType, OmitType } from '@nestjs/mapped-types';
import { SignUpUserDto } from 'src/modules/auth/dto/sign-up-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(SignUpUserDto, ['password', 'email'] as const),
) {}
