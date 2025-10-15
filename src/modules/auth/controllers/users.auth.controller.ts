import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersAuthService } from '../services/users.auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { SignUpUserDto } from '../dto/sign-up-user.dto';
import { UsersService } from 'src/modules/users/users.service';
import {
  ResetPasswordDto,
  ResetPasswordWithTokenDto,
  VerifyOtpDto,
} from '../dto/auth.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from 'src/common/services/file-upload.service';
import { CompleteProfileDto } from '../dto/complete-profile.dto';

@Controller('auth')
export class UsersAuthController {
  constructor(
    private readonly UsersAuthService: UsersAuthService,
    private readonly usersService: UsersService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post('sign-up')
  @UseInterceptors(FileInterceptor('profileImage'))
  async signUp(
    @Body() signUpUserDto: SignUpUserDto,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    let profileImageUrl: string | undefined;

    if (profileImage) {
      profileImageUrl = await this.fileUploadService.uploadFile(
        profileImage,
        'profiles',
      );
    }

    return this.UsersAuthService.signUp({
      ...signUpUserDto,
      profileImage: profileImageUrl,
    });
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('local-login')
  localLogin(@Request() req) {
    return this.UsersAuthService.genrateUserTokens(req.user);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh-token')
  refreshToken(@Request() req) {
    return this.UsersAuthService.genrateUserTokens(req.user);
  }

  @Post('google/login')
  @UseGuards(AuthGuard('google'))
  async googleLogin(@Request() req) {
    const { isNewUser, ...user } = req.user;

    const tokens = await this.UsersAuthService.genrateUserTokens(user);
    return {
      ...tokens,
      isNewUser,
    };
  }

  @Post('facebook/login')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(@Request() req) {
    const { isNewUser, ...user } = req.user;
    const tokens = await this.UsersAuthService.genrateUserTokens(user);
    return { ...tokens, isNewUser };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-access'))
  @Post('complete-profile')
  @UseInterceptors(FileInterceptor('profileImage'))
  async completeProfile(
    @Request() req,
    @Body() dto: CompleteProfileDto,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    let profileImageUrl: string | undefined;

    if (profileImage) {
      profileImageUrl = await this.fileUploadService.uploadFile(
        profileImage,
        'profiles',
      );
    }

    return this.UsersAuthService.completeUserProfile(req.user.id, {
      ...dto,
      profileImage: profileImageUrl,
    });
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-access'))
  @Post('logout')
  logout(@Request() req) {
    return this.usersService.deactivateUser(req.user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('request-password-reset')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.UsersAuthService.resetPassword(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-reset-code')
  async verifyResetCode(@Body() dto: VerifyOtpDto) {
    return this.UsersAuthService.verifyResetCode(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPasswordWithToken(@Body() dto: ResetPasswordWithTokenDto) {
    return this.UsersAuthService.resetPasswordWithToken(dto);
  }
}
