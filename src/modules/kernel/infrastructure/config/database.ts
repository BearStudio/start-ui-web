import { z } from 'zod';

import { baseEnvSchema, parseEnv } from './env-schema';

const databaseEnvSchema = baseEnvSchema.extend({
  DATABASE_URL: z.url(),
});

export type DatabaseConfig = {
  databaseUrl: string;
};

let cachedDatabaseConfig: DatabaseConfig | undefined;

export function getDatabaseConfig(): DatabaseConfig {
  if (cachedDatabaseConfig) return cachedDatabaseConfig;

  const env = parseEnv(databaseEnvSchema);
  cachedDatabaseConfig = {
    databaseUrl: env.DATABASE_URL,
  };
  return cachedDatabaseConfig;
}
