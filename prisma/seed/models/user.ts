import { faker } from '@faker-js/faker';
import { emphasis, prisma } from 'prisma/seed/utils';

export async function createUsers() {
  console.log(`⏳ Seeding users`);

  let createdUsersCounter = 0;
  const existingUsersCount = await prisma.user.count();

  await Promise.all(
    Array.from({ length: Math.max(0, 26 - existingUsersCount) }, async () => {
      await prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
          accountStatus: 'ENABLED',
        },
      });
      createdUsersCounter += 1;
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
    createdUsersCounter += 1;
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
    createdUsersCounter += 1;
  }

  console.log(
    `✅ ${existingUsersCount} existing user 👉 ${createdUsersCounter} users created`
  );
  console.log(`👉 Admin connect with: ${emphasis('admin@admin.com')}`);
  console.log(`👉 User connect with: ${emphasis('user@user.com')}`);
}
