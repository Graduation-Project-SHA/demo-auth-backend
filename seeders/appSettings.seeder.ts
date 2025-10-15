import { PrismaClient } from '@prisma/client';

export async function seedAppSettings(prisma: PrismaClient) {
  console.log('Seeding app settings...');

  const existingSettings = await prisma.appSettings.findFirst();

  if (!existingSettings) {
    await prisma.appSettings.create({
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
    console.log('App settings seeded successfully');
  } else {
    console.log('App settings already exist');
  }
}
