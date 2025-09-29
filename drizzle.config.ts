import { Config } from 'drizzle-kit';

import { envServer } from '@/env/server';

export default {
  schema: './src/server/db/schemas/index.ts',
  dialect: 'postgresql',
  dbCredentials: { url: envServer.DATABASE_URL },
} satisfies Config;
