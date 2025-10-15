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

  async distributeEarnings(coachId: string, amount: number) {
    const commissionRate = await this.getCommissionRate();
    const coachEarnings = amount * (1 - commissionRate);
    const appCommission = amount * commissionRate;

    await this.prisma.coachProfile.update({
      where: { id: coachId },
      data: {
        balance: {
          increment: coachEarnings,
        },
      },
    });

    return {
      totalAmount: amount,
      coachEarnings,
      appCommission,
      commissionRate,
    };
  }

  async getCoachBalance(coachId: string) {
    const coach = await this.prisma.coachProfile.findUnique({
      where: { id: coachId },
      select: { balance: true },
    });

    return coach?.balance || 0;
  }
}
