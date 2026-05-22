import { type BookRepository, createBookUseCases } from '@/modules/book';
import { BookRepositoryDrizzle } from '@/modules/book/infrastructure/drizzle/book-repository-drizzle';

import { getKernel, type Kernel } from './kernel';
import { createCachedFactory } from './shared/singleton';

export type BookOverrides = {
  kernel?: Kernel;
  bookRepository?: BookRepository;
};

const buildBookUseCases = (overrides?: BookOverrides) => {
  const kernel = overrides?.kernel ?? getKernel();
  return createBookUseCases({
    bookRepository:
      overrides?.bookRepository ?? new BookRepositoryDrizzle(kernel.db),
    permissionChecker: kernel.permissionChecker,
    logger: kernel.logger,
  });
};

const factory = createCachedFactory(buildBookUseCases);

export const getBookUseCases = (overrides?: BookOverrides) =>
  factory.get(overrides);

/** Test-only. */
export const __resetBookComposition = () => factory.reset();
