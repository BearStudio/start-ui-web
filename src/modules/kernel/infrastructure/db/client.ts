import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import type { TransactionRunner } from '@/modules/kernel/application/ports/transaction-runner';
import { env } from '@/modules/kernel/infrastructure/config/env';

import * as schema from './schema';

function createDb() {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
  });

  return Object.assign(drizzle(pool, { schema, casing: 'camelCase' }), {
    $client: pool,
  });
}

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof createDb> | undefined;
};

export const db = globalForDb.db ?? createDb();

export { schema };
export type Database = typeof db;
export type DatabaseTransaction = Parameters<
  Parameters<Database['transaction']>[0]
>[0];

export const transactionRunner: TransactionRunner<DatabaseTransaction> = {
  run: (work) => db.transaction((tx) => work(tx)),
};

if (import.meta.env.DEV) globalForDb.db = db;
