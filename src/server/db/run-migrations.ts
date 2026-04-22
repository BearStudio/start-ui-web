import { runDrizzleMigrations } from '@/server/db/migrate';

runDrizzleMigrations().catch((error) => {
  console.error(error);
  process.exit(1);
});
