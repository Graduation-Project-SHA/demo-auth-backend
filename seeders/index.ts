import { PrismaClient } from '@prisma/client';

import seedPermissions from './resources.seeder';
import seedSuperAdminRole from './superAdminRole.seeder';
import seedSuperAdmin from './superAdmin.seeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting seeding process...\n');

  // 1. Seed permissions
  console.log('🔐 Seeding permissions...');
  await seedPermissions(prisma);
  console.log('✅ Permissions seeded.\n');

  // 2. Seed super admin role
  console.log('👑 Seeding Super Admin Role...');
  await seedSuperAdminRole(prisma);
  console.log('✅ Super Admin Role seeded.\n');

  // 3. Seed super admin user
  console.log('🙋‍♂️ Seeding Super Admin User...');
  await seedSuperAdmin(prisma);
  console.log('✅ Super Admin User seeded.\n');

  console.log('🎉 Seeding completed successfully.');
}

main()
  .catch((error) => {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
