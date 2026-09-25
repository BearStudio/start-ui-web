/* eslint-disable no-process-env */
import { defineConfig } from 'prisma/config';

// Prisma 7 no longer loads `.env` files. Commands that need the database
// (`db:push`, `db:ui`) are run through `dotenv-cli` in package.json.
// `process.env` is read directly (not `env()`) so `prisma generate` still works
// without DATABASE_URL (Docker build, CI install).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
