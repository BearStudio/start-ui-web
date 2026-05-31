import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';

import type { DatabaseDriver } from '@/modules/kernel/infrastructure/config/database';

import type * as schema from './schema';

export type DbClient = PgDatabase<PgQueryResultHKT, typeof schema>;

export type DbTransaction = Parameters<
  Parameters<DbClient['transaction']>[0]
>[0];

export type DbLike = DbClient | DbTransaction;
export type TransactionCapableDb = DbClient;
export type RunInTransaction = <T>(
  work: (transaction: DbTransaction) => Promise<T>
) => Promise<T>;

export type DatabaseClientHandle = {
  query: <TRow extends Record<string, unknown> = Record<string, unknown>>(
    queryText: string,
    values?: readonly unknown[]
  ) => Promise<{ rows: TRow[] }>;
  end: () => Promise<void>;
};

export type DatabaseMetadata = {
  $client: DatabaseClientHandle;
  $driver: DatabaseDriver;
  $transactionCapable: boolean;
  $runInTransaction?: RunInTransaction;
  $close: () => Promise<void>;
};

export type Database = DbClient & DatabaseMetadata;

export type TransactionCapableDatabase = TransactionCapableDb &
  DatabaseMetadata & {
    $runInTransaction: RunInTransaction;
  };

export function isRootDatabase(db: DbLike): db is Database {
  return (
    typeof db === 'object' &&
    db !== null &&
    '$driver' in db &&
    '$transactionCapable' in db
  );
}

export function isTransactionCapableDatabase(
  db: DbLike
): db is TransactionCapableDatabase {
  return isRootDatabase(db) && typeof db.$runInTransaction === 'function';
}
