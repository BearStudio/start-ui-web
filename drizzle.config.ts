/* eslint-disable no-process-env */
import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run Drizzle commands.');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/modules/kernel/infrastructure/db/schema/**/*.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    url: databaseUrl,
  },
  casing: 'camelCase',
});
