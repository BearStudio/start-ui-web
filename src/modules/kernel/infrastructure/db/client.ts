import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import type { TransactionRunner } from '@/modules/kernel/application/ports/transaction-runner';
import { env } from '@/modules/kernel/infrastructure/config/env';

import * as schema from './schema';

export function createDbClient(options?: { url?: string }) {
  const pool = new Pool({
    connectionString: options?.url ?? env.DATABASE_URL,
  });

  return Object.assign(drizzle(pool, { schema, casing: 'camelCase' }), {
    $client: pool,
  });
}

export type Database = ReturnType<typeof createDbClient>;
export type DatabaseTransaction = Parameters<
  Parameters<Database['transaction']>[0]
>[0];

const globalForDb = globalThis as unknown as {
  db: Database | undefined;
};

let defaultDb = globalForDb.db;

export function getDefaultDbClient(): Database {
  if (!defaultDb) {
    defaultDb = createDbClient();
    if (import.meta.env?.DEV) globalForDb.db = defaultDb;
  }
  return defaultDb;
}

export { schema };

export function createTransactionRunner(
  database: Database
): TransactionRunner<DatabaseTransaction> {
  return {
    run: (work) => database.transaction((tx) => work(tx)),
  };
}

let defaultTransactionRunner:
  | TransactionRunner<DatabaseTransaction>
  | undefined;

export function getDefaultTransactionRunner() {
  if (!defaultTransactionRunner) {
    defaultTransactionRunner = createTransactionRunner(getDefaultDbClient());
  }
  return defaultTransactionRunner;
}

export const db = new Proxy({} as Database, {
  get(_target, prop) {
    const database = getDefaultDbClient();
    const value = Reflect.get(database, prop, database);
    return typeof value === 'function' ? value.bind(database) : value;
  },
});

export const transactionRunner = new Proxy(
  {} as TransactionRunner<DatabaseTransaction>,
  {
    get(_target, prop) {
      const runner = getDefaultTransactionRunner();
      const value = Reflect.get(runner, prop, runner);
      return typeof value === 'function' ? value.bind(runner) : value;
    },
  }
);
