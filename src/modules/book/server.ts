import type { BookRepository } from '@/modules/book';
import type { DbLike } from '@/modules/kernel/infrastructure/db/types';

import { BookRepositoryDrizzle } from './infrastructure/drizzle/book-repository-drizzle';

export const createServerBookRepository = (db: DbLike): BookRepository =>
  new BookRepositoryDrizzle(db);
