import { faker } from '@faker-js/faker';
import { eq, sql } from 'drizzle-orm';

import { db } from '@/server/db';
import { user } from '@/server/db/schema';

import { emphasis } from './_utils';

export async function createUsers() {
  console.log(`⏳ Seeding users`);

  let createdCounter = 0;
  const [countRow] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(user);
  const existingCount = countRow?.count ?? 0;

  await Promise.all(
    Array.from({ length: Math.max(0, 98 - existingCount) }, async () => {
      await db.insert(user).values({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        emailVerified: true,
        role: 'user',
      });
      createdCounter += 1;
    })
  );

  const existingUserUser = await db.query.user.findFirst({
    where: eq(user.email, 'user@user.com'),
  });
  if (!existingUserUser) {
    await db.insert(user).values({
      name: 'User',
      email: 'user@user.com',
      emailVerified: true,
      onboardedAt: new Date(),
      role: 'user',
    });
    createdCounter += 1;
  }

  const existingAdminUser = await db.query.user.findFirst({
    where: eq(user.email, 'admin@admin.com'),
  });
  if (!existingAdminUser) {
    await db.insert(user).values({
      name: 'Admin',
      email: 'admin@admin.com',
      emailVerified: true,
      role: 'admin',
      onboardedAt: new Date(),
    });
    createdCounter += 1;
  }

  console.log(
    `✅ ${existingCount} existing user 👉 ${createdCounter} users created`
  );
  console.log(`👉 Admin connect with: ${emphasis('admin@admin.com')}`);
  console.log(`👉 User connect with: ${emphasis('user@user.com')}`);
}
