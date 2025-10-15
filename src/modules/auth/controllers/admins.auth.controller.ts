import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AdminAuthSevice } from '../services/admins.auth.service';
import { AuthGuard } from '@nestjs/passport';
import { IsActiveGuard } from '../guards/is-active.guard';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthSevice) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard, IsActiveGuard)
  @Post('local-login')
  localLogin(@Request() req) {
    return this.adminAuthService.genrateAdminTokens(req.user);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'), IsActiveGuard)
  @Post('refresh-token')
  refreshToken(@Request() req) {
    return this.adminAuthService.genrateAdminTokens(req.user);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-access'), IsActiveGuard)
  @Post('logout')
  logout(@Request() req) {
    return this.adminAuthService.removeRefreshToken(req.user.id);
  }
}
