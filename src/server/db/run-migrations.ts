import { drizzleDb } from '@/server/db';
import { runDrizzleMigrations } from '@/server/db/migrate';

void (async () => {
  try {
    await runDrizzleMigrations();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await drizzleDb.$client.end();
  }
})();
