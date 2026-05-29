import { faker } from '@faker-js/faker';
import { notInArray, sql } from 'drizzle-orm';

import { getDefaultDbClient } from '@/modules/kernel/infrastructure/db/client';
import { user } from '@/modules/kernel/infrastructure/db/schema';

import { emphasis } from './_utils';

const demoUserEmails = ['user@user.com', 'admin@admin.com'];
const demoOnboardedAt = new Date('2024-01-01T00:00:00.000Z');

export async function createUsers() {
  console.log(`⏳ Seeding users`);
  const db = getDefaultDbClient();

  let createdCounter = 0;
  const [countRow] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(user)
    .where(notInArray(user.email, demoUserEmails));
  const existingRandomUserCount = countRow?.count ?? 0;

  const usersToSeed = Array.from(
    { length: Math.max(0, 98 - existingRandomUserCount) },
    () => ({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      emailVerified: true,
      role: 'user' as const,
    })
  );

  if (usersToSeed.length > 0) {
    const inserted = await db
      .insert(user)
      .values(usersToSeed)
      .onConflictDoNothing()
      .returning({ id: user.id });
    createdCounter += inserted.length;
  }

  const [insertedUser] = await db
    .insert(user)
    .values({
      name: 'User',
      email: 'user@user.com',
      emailVerified: true,
      onboardedAt: demoOnboardedAt,
      role: 'user',
    })
    .onConflictDoNothing()
    .returning({ id: user.id });
  if (insertedUser) {
    createdCounter += 1;
  }

  const [insertedAdmin] = await db
    .insert(user)
    .values({
      name: 'Admin',
      email: 'admin@admin.com',
      emailVerified: true,
      role: 'admin',
      onboardedAt: demoOnboardedAt,
    })
    .onConflictDoNothing()
    .returning({ id: user.id });
  if (insertedAdmin) {
    createdCounter += 1;
  }

  console.log(
    `✅ ${existingRandomUserCount} existing random users 👉 ${createdCounter} users created`
  );
  console.log(`👉 Admin connect with: ${emphasis('admin@admin.com')}`);
  console.log(`👉 User connect with: ${emphasis('user@user.com')}`);
}
