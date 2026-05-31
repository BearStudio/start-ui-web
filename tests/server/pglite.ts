import { inject } from 'vitest';

import {
  createDbClient,
  type Database,
} from '@/modules/kernel/infrastructure/db/client';

import { pgliteTestDatabaseUrlContextKey } from './pglite-context';

type TableRow = {
  schemaname: string;
  tablename: string;
};

const quoteIdentifier = (value: string) => `"${value.replaceAll('"', '""')}"`;

const getPublicTableNames = async (db: Database) => {
  const result = await db.$client.query<TableRow>(
    "SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '__drizzle_migrations' ORDER BY tablename"
  );

  return result.rows.map(
    ({ schemaname, tablename }) =>
      `${quoteIdentifier(schemaname)}.${quoteIdentifier(tablename)}`
  );
};

const truncateDatabase = async (db: Database) => {
  const tableNames = await getPublicTableNames(db);
  if (tableNames.length === 0) return;

  await db.$client.query(
    `TRUNCATE TABLE ${tableNames.join(', ')} RESTART IDENTITY CASCADE`
  );
};

export async function createPgliteTestDatabase(options?: {
  databaseUrl?: string;
}) {
  const databaseUrl =
    options?.databaseUrl ?? inject(pgliteTestDatabaseUrlContextKey);

  if (!databaseUrl) {
    throw new Error(
      'PGlite test database URL was not provided. Use the integration Vitest project.'
    );
  }

  const db = createDbClient({ url: databaseUrl });

  return {
    db,
    truncate: () => truncateDatabase(db),
    reset: () => truncateDatabase(db),
    close: () => db.$close(),
  };
}
