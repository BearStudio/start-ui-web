import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { envServer } from '@/env/server';

import * as schema from './schemas';

const pool = new Pool({
  connectionString: envServer.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema,
});

export const dbSchemas = schema;
