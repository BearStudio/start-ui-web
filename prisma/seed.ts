import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  let createdUsersCounter = 0;
  const existingUsersCount = await prisma.user.count();

  if (!(await prisma.user.findUnique({ where: { login: 'admin' } }))) {
    const adminPassword = await bcrypt.hash('admin', 12);
    await prisma.user.create({
      data: {
        email: 'admin@admin.com',
        login: 'admin',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'Admin',
        activated: true,
        langKey: 'en',
        authorities: 'ROLE_ADMIN',
      },
    });
    createdUsersCounter += 1;
  }

  if (!(await prisma.user.findUnique({ where: { login: 'user' } }))) {
    const userPassword = await bcrypt.hash('user', 12);
    await prisma.user.create({
      data: {
        email: 'user@user.com',
        login: 'user',
        password: userPassword,
        firstName: 'User',
        lastName: 'User',
        activated: true,
        langKey: 'en',
        authorities: 'ROLE_USER',
      },
    });
    createdUsersCounter += 1;
  }

  const password = await bcrypt.hash('password', 12);
  await Promise.all(
    Array.from({ length: Math.max(0, 26 - existingUsersCount) }, async () => {
      await prisma.user.create({
        data: {
          email: faker.internet.email(),
          login: faker.internet.userName(),
          password: password,
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          activated: true,
          langKey: 'en',
          authorities: 'ROLE_USER',
        },
      });
      createdUsersCounter += 1;
    })
  );

  console.log(
    `✅ ${existingUsersCount} existing user 👉 ${createdUsersCounter} users created`
  );
  console.log(`👉 Admin connect with: admin/admin`);
  console.log(`👉 User connect with: user/user`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
