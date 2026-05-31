import { Client as NeonClient, neonConfig } from '@neondatabase/serverless';
import type { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNeonWebsocket } from 'drizzle-orm/neon-serverless';
import { migrate as migrateNeonWebsocket } from 'drizzle-orm/neon-serverless/migrator';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleNodePg } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createRequire } from 'node:module';
import { Client as PgClient } from 'pg';

import { ConfigurationError } from '@/modules/kernel/domain/errors/configuration-error';
import {
  getMigrationDatabaseConfig,
  type MigrationDatabaseConfig,
  type MigrationDatabaseDriver,
} from '@/modules/kernel/infrastructure/config/database';

import * as schema from './schema';

const migrationConfig = {
  migrationsFolder: 'drizzle/migrations',
} as const;

const MIGRATION_LOCK_NAMESPACE = 'start-ui-web';
const MIGRATION_LOCK_KEY = 'drizzle-migrations';

const require = createRequire(import.meta.url);

export type MigrationDatabaseClient = {
  connect: () => Promise<void>;
  query: <TRow extends Record<string, unknown> = Record<string, unknown>>(
    queryText: string,
    values?: unknown[]
  ) => Promise<{ rows: TRow[] }>;
  end: () => Promise<void>;
};

export type MigrationDatabase = (
  | NodePgDatabase<typeof schema>
  | NeonDatabase<typeof schema>
) & {
  $migrationDriver: MigrationDatabaseDriver;
  $client: MigrationDatabaseClient;
  $close: () => Promise<void>;
};

function withMigrationMetadata<TDb extends object>(
  db: TDb,
  metadata: {
    driver: MigrationDatabaseDriver;
    client: MigrationDatabaseClient;
  }
): MigrationDatabase {
  return Object.assign(db, {
    $migrationDriver: metadata.driver,
    $client: metadata.client,
    $close: () => metadata.client.end(),
  }) as unknown as MigrationDatabase;
}

function createNodePgMigrationDb(url: string): MigrationDatabase {
  const client = new PgClient({ connectionString: url });
  const db = drizzleNodePg(client, { schema, casing: 'camelCase' });

  return withMigrationMetadata(db, {
    driver: 'node-pg',
    client: client as unknown as MigrationDatabaseClient,
  });
}

function createNeonWebsocketMigrationDb(url: string): MigrationDatabase {
  const WebSocket = require('ws') as unknown;
  neonConfig.webSocketConstructor =
    WebSocket as typeof neonConfig.webSocketConstructor;

  const client = new NeonClient(url);
  const db = drizzleNeonWebsocket({
    client,
    ws: WebSocket,
    schema,
    casing: 'camelCase',
  });

  return withMigrationMetadata(db, {
    driver: 'neon-websocket',
    client: client,
  });
}

export async function createMigrationDbClient(
  config: MigrationDatabaseConfig = getMigrationDatabaseConfig()
): Promise<MigrationDatabase> {
  const db =
    config.driver === 'node-pg'
      ? createNodePgMigrationDb(config.databaseUrl)
      : createNeonWebsocketMigrationDb(config.databaseUrl);

  try {
    await db.$client.connect();
  } catch (error) {
    await db.$close().catch(() => undefined);
    throw error;
  }

  return db;
}

async function acquireMigrationLock(
  client: MigrationDatabaseClient
): Promise<() => Promise<void>> {
  const { rows } = await client.query<{ acquired: boolean }>(
    'SELECT pg_try_advisory_lock(hashtext($1), hashtext($2)) AS acquired',
    [MIGRATION_LOCK_NAMESPACE, MIGRATION_LOCK_KEY]
  );

  if (rows[0]?.acquired !== true) {
    throw new ConfigurationError(
      'Database migration lock is already held by another process.'
    );
  }

  let released = false;
  return async () => {
    if (released) return;
    released = true;
    await client.query(
      'SELECT pg_advisory_unlock(hashtext($1), hashtext($2))',
      [MIGRATION_LOCK_NAMESPACE, MIGRATION_LOCK_KEY]
    );
  };
}

async function runMigration(db: MigrationDatabase) {
  if (db.$migrationDriver === 'node-pg') {
    await migrate(db as NodePgDatabase<typeof schema>, migrationConfig);
    return;
  }

  await migrateNeonWebsocket(
    db as unknown as NeonDatabase<typeof schema>,
    migrationConfig
  );
}

export async function migrateDatabase(db: MigrationDatabase) {
  const releaseLock = await acquireMigrationLock(db.$client);

  try {
    await runMigration(db);
  } finally {
    await releaseLock();
  }
}
