import { createMigrationDbClient, migrateDatabase } from './migrate';

const db = await createMigrationDbClient();

try {
  await migrateDatabase(db);
} finally {
  await db.$close();
}
