import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type { Database } from '@/modules/kernel/infrastructure/db/client';
import * as schema from '@/modules/kernel/infrastructure/db/schema';

export async function createPgliteTestDb() {
  const client = new PGlite();
  const migration = await readFile(
    path.resolve(process.cwd(), 'drizzle/migrations/0000_marvelous_zzzax.sql'),
    'utf8'
  );
  await client.exec(migration.replaceAll('--> statement-breakpoint', ''));

  return {
    client,
    db: drizzle(client, { schema, casing: 'camelCase' }) as unknown as Database,
  };
}
