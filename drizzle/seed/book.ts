import { faker } from '@faker-js/faker';
import { sql } from 'drizzle-orm';

import { getDefaultDbClient } from '@/modules/kernel/infrastructure/db/client';
import { book, genre } from '@/modules/kernel/infrastructure/db/schema';

import data from './book-data.json';

export async function createBooks() {
  console.log(`⏳ Seeding genre`);
  const db = getDefaultDbClient();
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

  if (existingGenresAfterSeed.length > 0) {
    const booksToSeed = data.books.map(({ author, title }, index) => {
      const deterministicGenre =
        existingGenresAfterSeed[index % existingGenresAfterSeed.length]!;

      return {
        author,
        title,
        genreId: deterministicGenre.id,
        publisher: faker.book.publisher(),
      };
    });

    if (booksToSeed.length > 0) {
      const inserted = await db
        .insert(book)
        .values(booksToSeed)
        .onConflictDoNothing()
        .returning({ id: book.id });
      createdCounter = inserted.length;
    }
  }

  console.log(
    `✅ ${existingCount} existing books 👉 ${createdCounter} books created`
  );
}
