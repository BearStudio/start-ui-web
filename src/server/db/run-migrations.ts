import { drizzleDb } from '@/server/db';
import { runDrizzleMigrations } from '@/server/db/migrate';

let exitCode = 0;

try {
  await runDrizzleMigrations();
} catch (error) {
  console.error(error);
  exitCode = 1;
} finally {
  try {
    await drizzleDb.$client.end();
  } catch (error) {
    console.error(error);
    exitCode = 1;
  }
}

process.exitCode = exitCode;
