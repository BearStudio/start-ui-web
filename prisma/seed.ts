import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Those are ANSI espace code to reverse and reset terminal print to emphase logins
// https://en.wikipedia.org/wiki/ANSI_escape_code
const REVERSE = '\x1b[7m';
const RESET = '\x1b[0m';

const prisma = new PrismaClient();

async function createUsers() {
  console.log(`⏳ Seeding users`);

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
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
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
  console.log(`👉 Admin connect with: ${REVERSE}admin/admin${RESET}`);
  console.log(`👉 User connect with: ${REVERSE}user/user${RESET}`);
}

async function createRepositories() {
  console.log(`⏳ Seeding repositories`);

  let createdRepositoriesCounter = 0;
  const existingRepositoriesCount = await prisma.repository.count();

  if (
    !(await prisma.repository.findUnique({ where: { name: 'Start UI [web]' } }))
  ) {
    await prisma.repository.create({
      data: {
        name: 'Start UI [web]',
        link: 'https://github.com/BearStudio/start-ui-web',
        description:
          '🚀 Start UI [web] is an opinionated UI starter with ⚛️ React, ▲ NextJS, ⚡️ Chakra UI, ⚛️ TanStack Query & 🐜 Formiz — From the 🐻 BearStudio Team',
      },
    });
    createdRepositoriesCounter += 1;
  }

  if (
    !(await prisma.repository.findUnique({
      where: { name: 'Start UI [native]' },
    }))
  ) {
    await prisma.repository.create({
      data: {
        name: 'Start UI [native]',
        link: 'https://github.com/BearStudio/start-ui-native',
        description:
          "🚀 Start UI [native] is a opinionated Expo starter repository created & maintained by the BearStudio Team and other contributors. It represents our team's up-to-date stack that we use when creating React Native apps for our clients.",
      },
    });
    createdRepositoriesCounter += 1;
  }

  console.log(
    `✅ ${existingRepositoriesCount} existing repositories 👉 ${createdRepositoriesCounter} repositories created`
  );
}

async function main() {
  await createRepositories();
  await createUsers();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
