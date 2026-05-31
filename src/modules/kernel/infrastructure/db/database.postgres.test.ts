import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  createDbClient,
  type Database,
} from '@/modules/kernel/infrastructure/db/client';
import {
  createMigrationDbClient,
  migrateDatabase,
} from '@/modules/kernel/infrastructure/db/migrate';
import { genre as genreTable } from '@/modules/kernel/infrastructure/db/schema';
import { makeGenreRow } from '@/tests/server/db-fixtures';

import { tryAcquirePostgresAdvisoryLock } from './postgres-advisory-lock';

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

describe('PostgreSQL database integration', () => {
  let container: StartedPostgreSqlContainer | undefined;
  let db: Database | undefined;
  let databaseUrl: string;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();
    databaseUrl = container.getConnectionUri();
    vi.stubEnv('DATABASE_URL', databaseUrl);
    vi.stubEnv('DATABASE_DRIVER', 'node-pg');
    const migrationDb = await createMigrationDbClient({
      databaseUrl,
      driver: 'node-pg',
    });
    try {
      await migrateDatabase(migrationDb);
    } finally {
      await migrationDb.$close();
    }
    db = createDbClient({ driver: 'node-pg', url: databaseUrl });
  });

  beforeEach(async () => {
    if (!db) throw new Error('PostgreSQL test database was not initialized.');
    await truncateDatabase(db);
  });

  afterAll(async () => {
    vi.unstubAllEnvs();
    await db?.$close();
    await container?.stop();
  });

  it('applies migrations and commits transactions', async () => {
    if (!db) throw new Error('PostgreSQL test database was not initialized.');

    await db.transaction(async (tx) => {
      await tx
        .insert(genreTable)
        .values(makeGenreRow({ id: 'genre-commit', name: 'Committed' }));
    });

    await expect(
      db.query.genre.findFirst({
        where: (genre, { eq }) => eq(genre.id, 'genre-commit'),
      })
    ).resolves.toMatchObject({ id: 'genre-commit' });
  });

  it('rolls back failed transactions', async () => {
    if (!db) throw new Error('PostgreSQL test database was not initialized.');

    await expect(
      db.transaction(async (tx) => {
        await tx
          .insert(genreTable)
          .values(makeGenreRow({ id: 'genre-rollback', name: 'Rolled Back' }));
        throw new Error('rollback requested');
      })
    ).rejects.toThrow('rollback requested');

    await expect(
      db.query.genre.findFirst({
        where: (genre, { eq }) => eq(genre.id, 'genre-rollback'),
      })
    ).resolves.toBeUndefined();
  });

  it('acquires, contends, and releases advisory locks', async () => {
    const firstLease = await tryAcquirePostgresAdvisoryLock({
      namespace: 'db-test',
      key: 'shared-lock',
    });
    expect(firstLease).toBeDefined();

    const contendedLease = await tryAcquirePostgresAdvisoryLock({
      namespace: 'db-test',
      key: 'shared-lock',
    });
    expect(contendedLease).toBeUndefined();

    await firstLease?.release();

    const secondLease = await tryAcquirePostgresAdvisoryLock({
      namespace: 'db-test',
      key: 'shared-lock',
    });
    expect(secondLease).toBeDefined();
    await secondLease?.release();
  });
});
