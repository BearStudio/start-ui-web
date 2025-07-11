import { db } from '@/server/db';

import { createBooks } from './book';
import { createUsers } from './user';

async function main() {
  await createBooks();
  await createUsers();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    db.$disconnect();
  });
