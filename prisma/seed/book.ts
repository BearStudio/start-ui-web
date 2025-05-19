import { faker } from '@faker-js/faker';

import { db } from '@/server/db';

export async function createBooks() {
  console.log(`⏳ Seeding books`);

  let createdCounter = 0;
  const existingCount = await db.book.count();

  await Promise.all(
    Array.from({ length: Math.max(0, 100 - existingCount) }, async () => {
      await db.book.create({
        data: {
          author: faker.book.author(),
          title: faker.book.title(),
          genre: faker.book.genre(),
          publisher: faker.book.publisher(),
        },
      });
      createdCounter += 1;
    })
  );

  console.log(
    `✅ ${existingCount} existing books 👉 ${createdCounter} books created`
  );
}
