import { faker } from '@faker-js/faker';
import { randomInt } from 'node:crypto';

import { db } from '@/server/db';

export async function createBooks() {
  console.log(`⏳ Seeding genre`);
  const existingGenres = await db.genre.findMany();

  const genres = [
    ['Adventure', '#9F0712'],
    ['Business', '#973C00'],
    ['Classic', '#3C6300'],
    ['Drama', '#006045'],
    ['Fantasy', '#005F78'],
    ['Mythology', '#193CB8'],
    ['Poetry', '#5D0EC0'],
    ['Romance', '#6E11B0'],
    ['Science Fiction', '#8A0194'],
    ['Thriller', '#A50036'],
  ] as const;

  const result = await db.genre.createMany({
    data: genres
      .filter(
        ([genre]) =>
          !existingGenres
            .map((existingGenre) => existingGenre.name)
            .includes(genre)
      )
      .map(([name, color]) => ({ name, color })),
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
