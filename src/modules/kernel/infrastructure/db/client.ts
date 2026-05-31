import { createRequire } from 'node:module';

import { drizzle as drizzleNeonHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzleNeonWebsocket } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNodePg } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import type { TransactionRunner } from '@/modules/kernel/application/ports/transaction-runner';
import { ConfigurationError } from '@/modules/kernel/domain/errors/configuration-error';
import {
  type DatabaseDriver,
  getDatabaseConfig,
} from '@/modules/kernel/infrastructure/config/database';
import { isDevRuntimeEnvironment } from '@/modules/kernel/infrastructure/config/env-schema';

import * as schema from './schema';
import {
  type Database,
  type DbLike,
  type DbTransaction,
  isTransactionCapableDatabase,
} from './types';

const require = createRequire(import.meta.url);

function withDatabaseMetadata<TDb extends object>(
  db: TDb,
  metadata: {
    driver: DatabaseDriver;
    transactionCapable: boolean;
    close: () => Promise<void>;
  }
): Database {
  return Object.assign(db, {
    $driver: metadata.driver,
    $transactionCapable: metadata.transactionCapable,
    $close: metadata.close,
  }) as unknown as Database;
}

export function createDbClient(options?: {
  driver?: DatabaseDriver;
  url?: string;
}): Database {
  const config = options?.url === undefined ? getDatabaseConfig() : undefined;
  const driver = options?.driver ?? config?.driver ?? 'node-pg';
  const url = options?.url ?? config?.databaseUrl;

  if (!url) {
    throw new ConfigurationError(
      'DATABASE_URL is required to create a database client.'
    );
  }

  if (driver === 'neon-http') {
    const database = drizzleNeonHttp(url, { schema, casing: 'camelCase' });
    return withDatabaseMetadata(database, {
      driver,
      transactionCapable: false,
      close: async () => undefined,
    });
  }

  if (driver === 'neon-websocket') {
    const WebSocket = require('ws') as unknown;
    const database = drizzleNeonWebsocket({
      connection: url,
      ws: WebSocket,
      schema,
      casing: 'camelCase',
    });
    return withDatabaseMetadata(database, {
      driver,
      transactionCapable: true,
      close: () => database.$client.end(),
    });
  }

  const pool = new Pool({
    connectionString: url,
  });

  return withDatabaseMetadata(
    drizzleNodePg(pool, { schema, casing: 'camelCase' }),
    {
      driver,
      transactionCapable: true,
      close: () => pool.end(),
    }
  );
}

export type { Database, DbLike, DbTransaction };

const globalForDb = globalThis as unknown as {
  db: Database | undefined;
};

let defaultDb = globalForDb.db;

export function getDefaultDbClient(): Database {
  if (!defaultDb) {
    defaultDb = createDbClient();
    if (isDevRuntimeEnvironment()) globalForDb.db = defaultDb;
  }
  return defaultDb;
}

export { schema };

export function createTransactionRunner(
  database: Database
): TransactionRunner<DbTransaction> {
  if (!isTransactionCapableDatabase(database)) {
    throw new ConfigurationError(
      `Database driver ${database.$driver} does not support interactive transactions.`
    );
  }

  return {
    run: (work) => database.transaction((tx) => work(tx)),
  };
}

let defaultTransactionRunner: TransactionRunner<DbTransaction> | undefined;

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
  {} as TransactionRunner<DbTransaction>,
  {
    get(_target, prop) {
      const runner = getDefaultTransactionRunner();
      const value = Reflect.get(runner, prop, runner);
      return typeof value === 'function' ? value.bind(runner) : value;
    },
  }
);
