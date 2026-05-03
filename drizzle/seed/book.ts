import { faker } from '@faker-js/faker';
import { and, eq, sql } from 'drizzle-orm';
import { randomInt } from 'node:crypto';

import { db } from '@/server/db';
import { book, genre } from '@/server/db/schema';

import data from './book-data.json';

export async function createBooks() {
  console.log(`⏳ Seeding genre`);
  const existingGenres = await db.select().from(genre);

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

  const existingGenreNames = existingGenres.map((g) => g.name);
  const newGenres = genres
    .filter(([name]) => !existingGenreNames.includes(name))
    .map(([name, color]) => ({ name, color }));

  let createdGenresCount = 0;
  if (newGenres.length > 0) {
    const inserted = await db
      .insert(genre)
      .values(newGenres)
      .onConflictDoNothing()
      .returning({ id: genre.id });
    createdGenresCount = inserted.length;
  }

  console.log(
    `✅ ${existingGenres.length} existing genres 👉 ${createdGenresCount} genres created`
  );

  console.log(`⏳ Seeding books`);

  let createdCounter = 0;
  const [countRow] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(book);
  const existingCount = countRow?.count ?? 0;
  const existingGenresAfterSeed = await db.select().from(genre);

  await Promise.all(
    data.books.map(async ({ author, title }) => {
      // Avoid creating existing books
      const existingBook = await db.query.book.findFirst({
        where: and(eq(book.author, author), eq(book.title, title)),
      });

      if (existingBook) {
        return;
      }

      const randomGenre =
        existingGenresAfterSeed[randomInt(existingGenresAfterSeed.length)];

      if (!randomGenre) return;

      await db.insert(book).values({
        author,
        title,
        genreId: randomGenre.id,
        publisher: faker.book.publisher(),
      });
      createdCounter += 1;
    })
  );

  console.log(
    `✅ ${existingCount} existing books 👉 ${createdCounter} books created`
  );
}
