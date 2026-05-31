import { migrate } from 'drizzle-orm/node-postgres/migrator';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { ConfigurationError } from '@/modules/kernel/domain/errors/configuration-error';

import { type Database, getDefaultDbClient } from './client';
import type * as schema from './schema';

export async function migrateDatabase(db: Database = getDefaultDbClient()) {
  if (db.$driver !== 'node-pg') {
    throw new ConfigurationError(
      `db:migrate currently requires the node-pg driver, received ${db.$driver}.`
    );
  }

  await migrate(db as NodePgDatabase<typeof schema>, {
    migrationsFolder: 'drizzle/migrations',
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await migrateDatabase();
  } finally {
    await getDefaultDbClient().$close();
  }
}
