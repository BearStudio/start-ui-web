import { db } from '@/server/db';

import { createRepositories } from './repository';
import { createUsers } from './user';

async function main() {
  await createRepositories();
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
