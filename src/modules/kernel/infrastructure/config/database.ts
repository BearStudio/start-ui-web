import { z } from 'zod';

import { baseEnvSchema, parseEnv } from './env-schema';

export const DATABASE_DRIVERS = [
  'node-pg',
  'neon-http',
  'neon-websocket',
] as const;

export type DatabaseDriver = (typeof DATABASE_DRIVERS)[number];

const databaseEnvSchema = baseEnvSchema.extend({
  DATABASE_URL: z.url(),
  DATABASE_DRIVER: z.enum(DATABASE_DRIVERS).default('node-pg'),
});

export type DatabaseConfig = {
  databaseUrl: string;
  driver: DatabaseDriver;
};

let cachedDatabaseConfig: DatabaseConfig | undefined;

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
