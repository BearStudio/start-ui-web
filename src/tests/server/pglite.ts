import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import type { Database } from '@/modules/kernel/infrastructure/db/client';
import * as schema from '@/modules/kernel/infrastructure/db/schema';

export async function createPgliteTestDb() {
  const client = new PGlite();
  const migrationsDir = path.resolve(process.cwd(), 'drizzle/migrations');
  const migrationFiles = (await readdir(migrationsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  // Keep test migrations in drizzle/migrations; use drizzle-kit push to keep tests current.
  for (const migrationFile of migrationFiles) {
    const migration = await readFile(
      path.join(migrationsDir, migrationFile),
      'utf8'
    );
    await client.exec(migration.replaceAll('--> statement-breakpoint', ''));
  }

  return {
    client,
    db: drizzle(client, { schema, casing: 'camelCase' }) as unknown as Database,
  };
}
