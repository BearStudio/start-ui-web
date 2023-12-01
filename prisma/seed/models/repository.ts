import { prisma } from 'prisma/seed/utils';

export async function createRepositories() {
  console.log(`⏳ Seeding repositories`);

  let createdCounter = 0;
  const existingCount = await prisma.repository.count();

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
    createdCounter += 1;
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
    createdCounter += 1;
  }

  console.log(
    `✅ ${existingCount} existing repositories 👉 ${createdCounter} repositories created`
  );
}
