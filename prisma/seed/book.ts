import { faker } from '@faker-js/faker';
import { randomInt } from 'node:crypto';

import { db } from '@/server/db';
import { books, genres as genresTable } from '@/server/db/schema';

import data from './book-data.json';
import {
  countBooks,
  findBookByTitleAndAuthor,
  listGenres,
} from './drizzle-utils';

export async function createBooks() {
  console.log(`⏳ Seeding genre`);
  const existingGenres = await listGenres();

  const seedGenres = [
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

  const genresToCreate = seedGenres
    .filter(
      ([genreName]) =>
        !existingGenres
          .map((existingGenre) => existingGenre.name)
          .includes(genreName)
    )
    .map(([name, color]) => ({
      id: faker.string.alphanumeric(25).toLowerCase(),
      name,
      color,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

  if (genresToCreate.length > 0) {
    await db.insert(genresTable).values(genresToCreate);
  }

  console.log(
    `✅ ${existingGenres.length} existing genres 👉 ${genresToCreate.length} genres created`
  );

  console.log(`⏳ Seeding books`);

  let createdCounter = 0;
  const existingCount = await countBooks();
  const existingGenresAfterSeed = await listGenres();

  await Promise.all(
    data.books.map(async ({ author, title }) => {
      // Avoid creating existing books
      const book = await findBookByTitleAndAuthor(title, author);

      if (book) {
        return;
      }

      await db.insert(books).values({
        id: faker.string.alphanumeric(25).toLowerCase(),
        author,
        title,
        genreId:
          existingGenresAfterSeed[randomInt(existingGenresAfterSeed.length)]!
            .id,
        publisher: faker.book.publisher(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      createdCounter += 1;
    })
  );

  console.log(
    `✅ ${existingCount} existing books 👉 ${createdCounter} books created`
  );
}
