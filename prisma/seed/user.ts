import { faker } from '@faker-js/faker';

import { db } from '@/server/db';

import { emphasis } from './_utils';

export async function createUsers() {
  console.log(`⏳ Seeding users`);

  let createdCounter = 0;
  const existingCount = await db.user.count();

  await Promise.all(
    Array.from({ length: Math.max(0, 98 - existingCount) }, async () => {
      await db.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
          emailVerified: true,
          role: 'user',
        },
      });
      createdCounter += 1;
    })
  );

  if (!(await db.user.findUnique({ where: { email: 'user@user.com' } }))) {
    await db.user.create({
      data: {
        name: 'User',
        email: 'user@user.com',
        emailVerified: true,
        onboardedAt: new Date(),
        role: 'user',
      },
    });
    createdCounter += 1;
  }

  if (!(await db.user.findUnique({ where: { email: 'admin@admin.com' } }))) {
    await db.user.create({
      data: {
        name: 'Admin',
        email: 'admin@admin.com',
        emailVerified: true,
        role: 'admin',
        onboardedAt: new Date(),
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
