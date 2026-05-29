import { faker } from '@faker-js/faker';

import { getDefaultDbClient } from '@/modules/kernel/infrastructure/db/client';

import { createBooks } from './book';
import { createUsers } from './user';

const SEED = 0x5eed;

async function main() {
  faker.seed(SEED);
  await createBooks();
  await createUsers();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getDefaultDbClient().$client.end();
  });
