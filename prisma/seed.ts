import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
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

  const password = await bcrypt.hash('password', 12);
  await Promise.all(
    Array.from({ length: 24 }, () =>
      prisma.user.create({
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
      })
    )
  );

  console.log(`✅ 26 users created`);
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
