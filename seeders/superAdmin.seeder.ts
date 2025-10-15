import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();  

export default async function seedSuperAdmin(prisma: PrismaClient) {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD is not defined in .env');
    return;
  }

  const existingUser = await prisma.admin.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('Super Admin user already exists.');
    return;
  }

  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'super-admin' },
  });

  if (!superAdminRole) {
    console.error('❌ Super Admin role not found. Please seed roles first.');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.admin.create({
    data: {
      name: 'System Admin',
      email,
      password: hashedPassword,
      roleId: superAdminRole.id,
    },
  });

  console.log('✅ Super Admin user created:', user.email);
}
