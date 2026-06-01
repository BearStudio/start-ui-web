import {
  type BookRepository,
  type BookTransactionContext,
  createBookUseCases,
} from '@/modules/book';
import { createBookRepository as createBookRepositoryDrizzle } from '@/modules/book/infrastructure/drizzle/book-repository-drizzle';
import type { TransactionRunner } from '@/modules/kernel';
import type { DbLike } from '@/modules/kernel/infrastructure/db/types';

import { getKernel, type Kernel } from './kernel';
import { createCachedFactory } from './shared/singleton';

export type BookOverrides = {
  kernel?: Kernel;
  bookRepository?: BookRepository;
};

const createBookRepository = (db: DbLike): BookRepository =>
  createBookRepositoryDrizzle({ db });

const createBookTransactionRunner = (
  kernel: Kernel,
  bookRepositoryOverride?: BookRepository
): TransactionRunner<BookTransactionContext> => {
  if (bookRepositoryOverride) {
    return {
      run: (work) => work({ bookRepository: bookRepositoryOverride }),
    };
  }

  return {
    run: (work, options) =>
      kernel.transactionRunner.run(
        (db) => work({ bookRepository: createBookRepository(db) }),
        options
      ),
  };
};

const buildBookUseCases = (overrides?: BookOverrides) => {
  const kernel = overrides?.kernel ?? getKernel();
  const bookRepository =
    overrides?.bookRepository ?? createBookRepository(kernel.db);
  return createBookUseCases({
    bookRepository,
    transactionRunner: createBookTransactionRunner(
      kernel,
      overrides?.bookRepository
    ),
    idGenerator: kernel.idGenerator,
    permissionChecker: kernel.permissionChecker,
    logger: kernel.logger,
  });
};

const factory = createCachedFactory(buildBookUseCases);

export const getBookUseCases = (overrides?: BookOverrides) =>
  factory.get(overrides);

/** Test-only. */
export const __resetBookComposition = () => factory.reset();
