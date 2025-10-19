import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/modules/users/users.service';
import * as bcrypt from 'bcrypt';
import { SignUpUserDto } from '../dto/sign-up-user.dto';
import { TokenService } from 'src/common/services/token.service';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompleteProfileDto } from '../dto/complete-profile.dto';
import {
  ResetPasswordDto,
  ResetPasswordWithTokenDto,
  VerifyOtpDto,
} from '../dto/auth.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { FileUploadService } from 'src/common/services/file-upload.service';
import { date } from 'joi';

@Injectable()
export class UsersAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly TokenService: TokenService,
    private readonly ConfigService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly prisma: PrismaService,
  ) {}

  private getJwtConfig() {
    const jwtExpiration = this.ConfigService.get<string>(
      'auth.user.jwtExpirationTime',
    );
    const jwtSecret = this.ConfigService.get<string>('auth.user.jwtSecret');
    const refreshExpiration = this.ConfigService.get<string>(
      'auth.user.refreshTokenExpirationTime',
    );
    const refreshSecret = this.ConfigService.get<string>(
      'auth.user.refreshTokenSecret',
    );
    if (!jwtExpiration || !jwtSecret || !refreshExpiration || !refreshSecret) {
      throw new Error(
        'Authentication configuration is missing from environment variables',
      );
    }
    return { jwtExpiration, jwtSecret, refreshExpiration, refreshSecret };
  }

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async signUp(SignUpUserDto: SignUpUserDto) {
    const data = SignUpUserDto;

    const existingUser = await this.usersService.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    return await this.usersService.createUser({
      ...data,
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    console.log(user);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!(await bcrypt.compare(password, user.password!))) {
      console.log('here');
      throw new UnauthorizedException('email or password is incorrect');
    }
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }

  async genrateUserTokens(user: any) {
    const payload = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const { jwtExpiration, jwtSecret, refreshExpiration, refreshSecret } =
      this.getJwtConfig();

    const accessToken = await this.TokenService.generateToken(
      payload,
      jwtExpiration,
      jwtSecret,
    );
    const refreshToken = await this.TokenService.generateToken(
      payload,
      refreshExpiration,
      refreshSecret,
    );

    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return {
      tokens: {
        accessToken,
        refreshToken,
      },
      date: {
        payload,
      },
    };
  }

  async completeUserProfile(userId: string, dto: CompleteProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.usersService.update(userId, {
      ...dto,
    });

    return updatedUser;
  }

  async findOrCreateGoogleUser(googlePayload: any) {
    let isNewUser = false;
    const { email, name, googleId } = googlePayload;

    let user = await this.prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      user = await this.prisma.user.findUnique({ where: { email } });
      if (user) {
        user = await this.prisma.user.update({
          where: { email },
          data: { googleId },
        });
      }
    }

    if (!user) {
      isNewUser = true;
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          googleId,
        },
      });
    }

    return { user, isNewUser };
  }

  async findOrCreateFacebookUser(profile: any) {
    let isNewUser = false;
    const facebookId = profile.id;

    const email =
      profile.emails && profile.emails.length > 0
        ? profile.emails[0].value
        : null;
    const name = profile.displayName;

    if (!email) {
      throw new UnauthorizedException(
        'Facebook account must have a public email.',
      );
    }

    let user = await this.prisma.user.findUnique({ where: { facebookId } });

    if (!user) {
      user = await this.prisma.user.findUnique({ where: { email } });
      if (user) {
        user = await this.prisma.user.update({
          where: { email },
          data: { facebookId },
        });
      }
    }

    if (!user) {
      isNewUser = true;
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          facebookId,
        },
      });
    }

    return { user, isNewUser };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }
    const resetCode = this.generateOtpCode();
    const resetCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailResetCode: resetCode,
        emailResetCodeExpiresAt: resetCodeExpiresAt,
      },
    });

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'كود إعادة تعيين كلمة المرور لتطبيقك',
      template: './password-reset',
      context: {
        name: user.name,
        code: resetCode,
      },
    });

    return { message: 'A password reset code has been sent to your email.' };
  }

  async verifyResetCode(dto: VerifyOtpDto): Promise<{ resetToken: string }> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || user.emailResetCode !== dto.code) {
      throw new BadRequestException('The code you entered is incorrect.');
    }

    if (
      !user.emailResetCodeExpiresAt ||
      new Date() > user.emailResetCodeExpiresAt
    ) {
      throw new BadRequestException(
        'The reset code has expired. Please request a new one.',
      );
    }

    const { jwtExpiration, jwtSecret } = this.getJwtConfig();

    const payload = { sub: user.id, purpose: 'password-reset' };
    const resetToken = await this.TokenService.generateToken(
      payload,
      '10m',
      jwtSecret,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailResetCode: null,
        emailResetCodeExpiresAt: null,
      },
    });
    return { resetToken };
  }
  async resetPasswordWithToken(
    dto: ResetPasswordWithTokenDto,
  ): Promise<{ message: string }> {
    const { jwtSecret } = this.getJwtConfig();
    try {
      const payload = await this.TokenService.verifyToken(
        dto.resetToken,
        jwtSecret,
      );

      if (payload.purpose !== 'password-reset') {
        throw new UnauthorizedException('Invalid token purpose.');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      await this.prisma.user.update({
        where: { id: payload.sub },
        data: {
          password: hashedPassword,
        },
      });

      return { message: 'Your password has been reset successfully.' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token.');
    }
  }
}
