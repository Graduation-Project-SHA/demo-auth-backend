import { PrismaClient } from '@prisma/client';

export default async function seedPermissions(prisma: PrismaClient) {
  const resources = [
    'admins',
    'roles',
    'users',
  ];

  // await prisma.permission.deleteMany({
  //   where: {
  //     resource: {
  //       notIn: resources,
  //     },
  //   },
  // });

  const existingPermissions = await prisma.permission.findMany({
    where: {
      resource: {
        in: resources,
      },
    },
    select: {
      resource: true,
    },
  });

  const existingResources = existingPermissions.map((p) => p.resource);
  const newResources = resources.filter((r) => !existingResources.includes(r));

  for (const resource of newResources) {
    await prisma.permission.create({
      data: { resource },
    });
  }
}
