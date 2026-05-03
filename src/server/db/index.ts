import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { envServer } from '@/env/server';

import * as schema from './schema';

function createDb() {
  const pool = new Pool({
    connectionString: envServer.DATABASE_URL,
  });

  return drizzle(pool, { schema, casing: 'camelCase' });
}

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof createDb> | undefined;
};

export const db = globalForDb.db ?? createDb();

export { schema };

if (import.meta.env.DEV) globalForDb.db = db;
