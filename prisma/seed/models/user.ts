import { faker } from '@faker-js/faker';
import { emphasis, prisma } from 'prisma/seed/utils';

export async function createUsers() {
  console.log(`⏳ Seeding users`);

  let createdCounter = 0;
  const existingCount = await prisma.user.count();

  await Promise.all(
    Array.from({ length: Math.max(0, 98 - existingCount) }, async () => {
      await prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
          accountStatus: 'ENABLED',
        },
      });
      createdCounter += 1;
    })
  );

  if (!(await prisma.user.findUnique({ where: { email: 'user@user.com' } }))) {
    await prisma.user.create({
      data: {
        name: 'User',
        email: 'user@user.com',
        accountStatus: 'ENABLED',
      },
    });
    createdCounter += 1;
  }

  if (
    !(await prisma.user.findUnique({ where: { email: 'admin@admin.com' } }))
  ) {
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@admin.com',
        authorizations: ['APP', 'ADMIN'],
        accountStatus: 'ENABLED',
      },
    });
    createdCounter += 1;
  }

  console.log(
    `✅ ${existingCount} existing user 👉 ${createdCounter} users created`
  );
  console.log(`👉 Admin connect with: ${emphasis('admin@admin.com')}`);
  console.log(`👉 User connect with: ${emphasis('user@user.com')}`);
}
