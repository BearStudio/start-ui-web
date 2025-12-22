import { db } from '@/server/db';

import { createBooks } from './book';
import { createGoodies } from './goodies';
import { createUsers } from './user';

async function main() {
  await createBooks();
  await createUsers();
  await createGoodies();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    db.$disconnect();
  });
