/* eslint-disable no-process-env */
import { defineConfig } from 'drizzle-kit';

const databaseUrl =
  process.env.DATABASE_MIGRATION_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_MIGRATION_URL or DATABASE_URL is required to run Drizzle commands.'
  );
}

if (process.env.DATABASE_MIGRATION_DRIVER === 'neon-http') {
  throw new Error(
    'DATABASE_MIGRATION_DRIVER=neon-http is not supported for transactional migrations.'
  );
}

function isLikelyTransactionPooledDatabaseUrl(url: string): boolean {
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

if (isLikelyTransactionPooledDatabaseUrl(databaseUrl)) {
  throw new Error(
    'Drizzle commands require DATABASE_MIGRATION_URL to use a direct or session-sticky PostgreSQL connection.'
  );
}

export default defineConfig({
  dialect: 'postgresql',
  schema: [
    './src/modules/kernel/infrastructure/db/schema/**/*.ts',
    './src/modules/*/infrastructure/drizzle/schema.ts',
  ],
  out: './drizzle/migrations',
  dbCredentials: {
    url: databaseUrl,
  },
  casing: 'camelCase',
});
