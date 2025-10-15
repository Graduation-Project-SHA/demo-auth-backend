import { PrismaClient } from '@prisma/client';

const PERMISSIONS = {
  READ: 1,
  WRITE: 2,
  DELETE: 4,
};

export default async function seedSuperAdminRole(prisma: PrismaClient) {
  const existingRole = await prisma.role.findUnique({
    where: { name: 'super-admin' },
  });

  if (existingRole) {
    console.log('Super Admin role already exists, skipping creation.');
    return;
  }

  const permissions = await prisma.permission.findMany();

  if (permissions.length === 0) {
    console.log(
      'No permissions found to assign. Creating role without permissions.',
    );
  }

  const role = await prisma.role.create({
    data: {
      name: 'super-admin',
      rolePermissions: {
        create: permissions.map((permission) => ({
          permissionId: permission.id,

          accessLevel:
            PERMISSIONS.READ + PERMISSIONS.WRITE + PERMISSIONS.DELETE,
        })),
      },
    },
    include: {
      rolePermissions: true,
    },
  });

  console.log('Super Admin role created successfully:', role);
}
