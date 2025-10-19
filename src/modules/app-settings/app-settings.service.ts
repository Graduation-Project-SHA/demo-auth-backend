import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  UpdateAppSettingsDto,
  UpdateCommissionRateDto,
} from './dto/update-app-settings.dto';

@Injectable()
export class AppSettingsService {
  constructor(private prisma: PrismaService) {}

  async getAppSettings() {
    let settings = await this.prisma.appSettings.findFirst();

    if (!settings) {
      settings = await this.prisma.appSettings.create({
        data: {
          appName: 'Sport App',
          commissionRate: 0.1,
          currency: 'EGP',
          supportEmail: 'support@sportapp.com',
          supportPhone: '+201000000000',
          appVersion: '1.0.0',
          maintenanceMode: false,
        },
      });
    }

    return settings;
  }

  async updateAppSettings(updateDto: UpdateAppSettingsDto) {
    const settings = await this.getAppSettings();

    return this.prisma.appSettings.update({
      where: { id: settings.id },
      data: updateDto,
    });
  }

  async getCommissionRate(): Promise<number> {
    const settings = await this.getAppSettings();
    return settings.commissionRate;
  }

  async updateCommissionRate(updateDto: UpdateCommissionRateDto) {
    const settings = await this.getAppSettings();

    return this.prisma.appSettings.update({
      where: { id: settings.id },
      data: { commissionRate: updateDto.commissionRate },
    });
  }

  async getAppName(): Promise<string> {
    const settings = await this.getAppSettings();
    return settings.appName;
  }

  async setMaintenanceMode(isEnabled: boolean) {
    const settings = await this.getAppSettings();

    return this.prisma.appSettings.update({
      where: { id: settings.id },
      data: { maintenanceMode: isEnabled },
    });
  }

  
}
