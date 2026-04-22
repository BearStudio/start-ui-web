import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';

import { db } from '@/server/db';
import { users } from '@/server/db/schema';

import { emphasis } from './_utils';
import { countUsers, findUserByEmail } from './drizzle-utils';
import { canonicalUsers, getCanonicalUserRepairData } from './user-fixtures';

export async function createUsers() {
  console.log(`⏳ Seeding users`);

  let createdCounter = 0;
  let repairedCounter = 0;
  const existingCount = await countUsers();

  for (const canonicalUser of canonicalUsers) {
    const existingUser = await findUserByEmail(canonicalUser.email);

    if (existingUser) {
      const repairData = getCanonicalUserRepairData(
        existingUser,
        canonicalUser
      );

      if (Object.keys(repairData).length > 0) {
        await db
          .update(users)
          .set(repairData)
          .where(eq(users.id, existingUser.id));
        repairedCounter += 1;
      }

      continue;
    }

    await db.insert(users).values({
      id: faker.string.alphanumeric(25).toLowerCase(),
      name: canonicalUser.name,
      email: canonicalUser.email,
      emailVerified: true,
      onboardedAt: new Date(),
      role: canonicalUser.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    createdCounter += 1;
  }

  console.log(
    `✅ ${existingCount} existing ${existingCount === 1 ? 'user' : 'users'} 👉 ${createdCounter} canonical users created 👉 ${repairedCounter} canonical users repaired`
  );
  console.log(`👉 Admin connect with: ${emphasis('admin@admin.com')}`);
  console.log(`👉 User connect with: ${emphasis('user@user.com')}`);
}
