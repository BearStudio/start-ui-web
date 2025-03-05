import { createRepositories } from './models/repository';
import { createUsers } from './models/user';
import { prisma } from './utils';

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
    prisma.$disconnect();
  });
