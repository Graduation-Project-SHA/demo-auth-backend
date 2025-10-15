import { Module } from '@nestjs/common';
import { AppSettingsController } from './app-settings.controller';
import { AppSettingsService } from './app-settings.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { AdminsModule } from '../admins/admins.module';

@Module({
  imports: [AdminsModule],
  controllers: [AppSettingsController],
  providers: [AppSettingsService, PrismaService, SuperAdminGuard],
  exports: [AppSettingsService],
})
export class AppSettingsModule {}
