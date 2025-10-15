import { Module, forwardRef } from '@nestjs/common';

import { CommonModule } from 'src/common/common.module';
import { AdminsModule } from '../admins/admins.module';

import { AuthService } from './services/auth.service';
import { AdminAuthController } from './controllers/admins.auth.controller';
import { AdminAuthSevice } from './services/admins.auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { AccessJwtStrategy } from './strategies/access.jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh.jwt.strategy';
import { PermissionsGuard } from './guards/permission.guard';
import { IsActiveGuard } from './guards/is-active.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UsersModule } from '../users/users.module';
import { UsersAuthService } from './services/users.auth.service';
import { UsersAuthController } from './controllers/users.auth.controller';

@Module({
  imports: [
    CommonModule,
    AdminsModule,
    PassportModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [AdminAuthController, UsersAuthController],
  providers: [
    AdminAuthSevice,
    UsersAuthService,
    AuthService,
    LocalStrategy,
    AccessJwtStrategy,
    RefreshJwtStrategy,
    PermissionsGuard,
    IsActiveGuard,
    LocalAuthGuard,
  ],
  exports: [PermissionsGuard, IsActiveGuard, LocalAuthGuard],
})
export class AuthModule {}
