import { z } from 'zod';

import { baseEnvSchema, parseEnv } from './env-schema';
import { ConfigurationError } from '../../domain/errors/configuration-error';

export const DATABASE_DRIVERS = [
  'node-pg',
  'neon-http',
  'neon-websocket',
] as const;

export type DatabaseDriver = (typeof DATABASE_DRIVERS)[number];
export type MigrationDatabaseDriver = Exclude<DatabaseDriver, 'neon-http'>;

const databaseEnvSchema = baseEnvSchema.extend({
  DATABASE_URL: z.url(),
  DATABASE_DRIVER: z.enum(DATABASE_DRIVERS).default('node-pg'),
  DATABASE_MIGRATION_URL: z.url().optional(),
  DATABASE_MIGRATION_DRIVER: z.enum(DATABASE_DRIVERS).optional(),
});

export type DatabaseConfig = {
  databaseUrl: string;
  driver: DatabaseDriver;
};

export type MigrationDatabaseConfig = {
  databaseUrl: string;
  driver: MigrationDatabaseDriver;
};

let cachedDatabaseConfig: DatabaseConfig | undefined;
let cachedMigrationDatabaseConfig: MigrationDatabaseConfig | undefined;

function getDefaultMigrationDriver(
  runtimeDriver: DatabaseDriver
): MigrationDatabaseDriver {
  return runtimeDriver === 'node-pg' ? 'node-pg' : 'neon-websocket';
}

function assertMigrationDriver(
  driver: DatabaseDriver
): asserts driver is MigrationDatabaseDriver {
  if (driver === 'neon-http') {
    throw new ConfigurationError(
      'DATABASE_MIGRATION_DRIVER=neon-http is not supported because Neon HTTP migrations are not transactional. Use node-pg or neon-websocket.'
    );
  }
}

export function getDatabaseConfig(): DatabaseConfig {
  if (cachedDatabaseConfig) return cachedDatabaseConfig;

  const env = parseEnv(databaseEnvSchema);
  cachedDatabaseConfig = {
    databaseUrl: env.DATABASE_URL,
    driver: env.DATABASE_DRIVER,
  };
  return cachedDatabaseConfig;
}

export function isLikelyTransactionPooledDatabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.includes('pooler') ||
      parsed.searchParams.get('pgbouncer') === 'true' ||
      parsed.searchParams.get('pool_mode') === 'transaction'
    );
  } catch {
    return false;
  }
}

export function getMigrationDatabaseConfig(): MigrationDatabaseConfig {
  if (cachedMigrationDatabaseConfig) return cachedMigrationDatabaseConfig;

  const env = parseEnv(databaseEnvSchema);
  const driver =
    env.DATABASE_MIGRATION_DRIVER ??
    getDefaultMigrationDriver(env.DATABASE_DRIVER);
  assertMigrationDriver(driver);

  const databaseUrl = env.DATABASE_MIGRATION_URL ?? env.DATABASE_URL;
  if (isLikelyTransactionPooledDatabaseUrl(databaseUrl)) {
    throw new ConfigurationError(
      'DATABASE_MIGRATION_URL must use a direct or session-sticky PostgreSQL connection. Transaction-pooler URLs are not safe for migrations.'
    );
  }

  cachedMigrationDatabaseConfig = {
    databaseUrl,
    driver,
  };
  return cachedMigrationDatabaseConfig;
}
