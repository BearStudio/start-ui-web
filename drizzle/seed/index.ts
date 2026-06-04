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

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  try {
    await getDefaultDbClient().$close();
  } catch (closeError) {
    console.error(closeError);
    process.exitCode = 1;
  }
}
