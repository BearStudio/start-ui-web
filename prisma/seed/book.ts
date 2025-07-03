import { faker } from '@faker-js/faker';
import { randomInt } from 'node:crypto';

import { db } from '@/server/db';

export async function createBooks() {
  console.log(`⏳ Seeding genre`);
  const existingGenres = await db.genre.findMany();

  const genres = [
    'Adventure',
    'Business',
    'Classic',
    'Drama',
    'Fantasy',
    'Mythology',
    'Poetry',
    'Romance',
    'Science Fiction',
    'Thriller',
  ];

  const result = await db.genre.createMany({
    data: genres
      .filter(
        (genre) =>
          !existingGenres
            .map((existingGenre) => existingGenre.name)
            .includes(genre)
      )
      .map((name) => ({ name, color: faker.color.rgb() })),
  });
  console.log(
    `✅ ${existingGenres.length} existing genres 👉 ${result.count} genres created`
  );

  console.log(`⏳ Seeding books`);

  let createdCounter = 0;
  const existingCount = await db.book.count();

  const existingGenresAfterSeed = await db.genre.findMany();

  await Promise.all(
    Array.from({ length: Math.max(0, 100 - existingCount) }, async () => {
      await db.book.create({
        data: {
          author: faker.book.author(),
          title: faker.book.title(),
          genre: {
            connect:
              existingGenresAfterSeed[
                randomInt(existingGenresAfterSeed.length)
              ],
          },
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
