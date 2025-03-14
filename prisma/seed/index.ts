import { db } from '@/server/db';

import { createRepositories } from './models/repository';
import { createUsers } from './models/user';

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
