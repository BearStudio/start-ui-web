import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { toBookId, toGenreId } from '@/modules/kernel/domain/ids';
import {
  createDbClient,
  type Database,
} from '@/modules/kernel/infrastructure/db/client';
import {
  createMigrationDbClient,
  migrateDatabase,
} from '@/modules/kernel/infrastructure/db/migrate';
import {
  book as bookTable,
  genre as genreTable,
} from '@/modules/kernel/infrastructure/db/schema';
import type { DbLike } from '@/modules/kernel/infrastructure/db/types';
import { makeBookRow, makeGenreRow } from '@/tests/server/db-fixtures';

import { BookRepositoryDrizzle } from '../drizzle/book-repository-drizzle';

type TableRow = {
  schemaname: string;
  tablename: string;
};

const quoteIdentifier = (value: string) => `"${value.replaceAll('"', '""')}"`;

async function truncateDatabase(db: Database) {
  const result = await db.$client.query<TableRow>(
    "SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '__drizzle_migrations' ORDER BY tablename"
  );
  const tableNames = result.rows.map(
    ({ schemaname, tablename }) =>
      `${quoteIdentifier(schemaname)}.${quoteIdentifier(tablename)}`
  );

  if (tableNames.length === 0) return;
  await db.$client.query(
    `TRUNCATE TABLE ${tableNames.join(', ')} RESTART IDENTITY CASCADE`
  );
}

describe('BookRepositoryDrizzle PostgreSQL integration', () => {
  let container: StartedPostgreSqlContainer | undefined;
  let db: Database | undefined;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();
    const databaseUrl = container.getConnectionUri();
    const migrationDb = await createMigrationDbClient({
      databaseUrl,
      driver: 'node-pg',
    });
    try {
      await migrateDatabase(migrationDb);
    } finally {
      await migrationDb.$close();
    }
    db = createDbClient({
      driver: 'node-pg',
      url: databaseUrl,
    });
  });

  beforeEach(async () => {
    if (!db) throw new Error('PostgreSQL test database was not initialized.');
    await truncateDatabase(db);
  });

  afterAll(async () => {
    await db?.$close();
    await container?.stop();
  });

  it('keeps repository work inside an existing transaction', async () => {
    if (!db) throw new Error('PostgreSQL test database was not initialized.');

    await db
      .insert(genreTable)
      .values(makeGenreRow({ id: 'genre-1', name: 'Original Genre' }));
    await db.insert(bookTable).values(
      makeBookRow({
        id: 'book-1',
        title: 'Original Title',
        author: 'Original Author',
        genreId: 'genre-1',
      })
    );

    await expect(
      db.transaction(async (tx) => {
        const repository = new BookRepositoryDrizzle(tx as DbLike);
        await repository.update(toBookId('book-1'), {
          title: 'Updated Title',
          author: 'Updated Author',
          genreId: toGenreId('genre-1'),
          publisher: null,
          coverId: null,
        });
        throw new Error('rollback repository update');
      })
    ).rejects.toThrow('rollback repository update');

    await expect(
      db.query.book.findFirst({
        where: (book, { eq }) => eq(book.id, 'book-1'),
      })
    ).resolves.toMatchObject({
      title: 'Original Title',
      author: 'Original Author',
    });
  });
});
