import { Controller, Get, Put, Body, UseGuards, Param } from '@nestjs/common';
import { AppSettingsService } from './app-settings.service';
import {
  UpdateAppSettingsDto,
  UpdateCommissionRateDto,
} from './dto/update-app-settings.dto';
import { AuthGuard } from '@nestjs/passport';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { IsActiveGuard } from '../auth/guards/is-active.guard';
import { RequireSuperAdmin } from '../auth/decorator/super-admin.decorator';

@Controller('admin/app-settings')
@UseGuards(AuthGuard('jwt-access'), IsActiveGuard, SuperAdminGuard)
@RequireSuperAdmin()
export class AppSettingsController {
  constructor(private readonly appSettingsService: AppSettingsService) {}

  @Get()
  async getAppSettings() {
    return this.appSettingsService.getAppSettings();
  }

  @Put()
  async updateAppSettings(@Body() updateDto: UpdateAppSettingsDto) {
    return this.appSettingsService.updateAppSettings(updateDto);
  }

  @Get('commission-rate')
  async getCommissionRate() {
    const rate = await this.appSettingsService.getCommissionRate();
    return { commissionRate: rate };
  }

  @Put('commission-rate')
  async updateCommissionRate(@Body() updateDto: UpdateCommissionRateDto) {
    return this.appSettingsService.updateCommissionRate(updateDto);
  }

  @Put('maintenance/:status')
  async setMaintenanceMode(@Param('status') status: string) {
    const isEnabled = status === 'enable';
    return this.appSettingsService.setMaintenanceMode(isEnabled);
  }

  
}
