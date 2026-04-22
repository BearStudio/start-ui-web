import { migrate } from 'drizzle-orm/postgres-js/migrator';

import { drizzleDb } from '@/server/db';

export async function runDrizzleMigrations() {
  await migrate(drizzleDb, {
    migrationsFolder: 'drizzle',
  });
}
