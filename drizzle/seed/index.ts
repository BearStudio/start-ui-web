import { db } from '@/modules/kernel/infrastructure/db/client';

import { createBooks } from './book';
import { createUsers } from './user';

async function main() {
  await createBooks();
  await createUsers();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$client.end();
  });
