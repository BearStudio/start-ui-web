import { db } from '@/server/db';

export async function createRepositories() {
  console.log(`⏳ Seeding repositories`);

  let createdCounter = 0;
  const existingCount = await db.repository.count();

  if (
    !(await db.repository.findUnique({ where: { name: 'Start UI [web]' } }))
  ) {
    await db.repository.create({
      data: {
        name: 'Start UI [web]',
        link: 'https://github.com/BearStudio/start-ui-web',
        description:
          '🚀 Start UI [web] is an opinionated UI starter with ⚛️ React, ▲ NextJS, ⚡️ Chakra UI, ⚛️ TanStack Query & 📋 React Hook Form — From the 🐻 BearStudio Team',
      },
    });
    createdCounter += 1;
  }

  if (
    !(await db.repository.findUnique({
      where: { name: 'Start UI [native]' },
    }))
  ) {
    await db.repository.create({
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
