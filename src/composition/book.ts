import type { BookRepository } from '@/modules/book/application/ports/book-repository';
import { createBookUseCases } from '@/modules/book/factory';
import { BookRepositoryDrizzle } from '@/modules/book/infrastructure/drizzle/book-repository-drizzle';

import { getKernel, type KernelOverrides } from './kernel';
import { createCachedFactory } from './shared/singleton';

export type BookCompositionOverrides = KernelOverrides & {
  bookRepository?: BookRepository;
};

const buildBookUseCases = (overrides?: BookCompositionOverrides) => {
  const kernel = getKernel({ overrides });
  return createBookUseCases({
    bookRepository:
      overrides?.bookRepository ?? new BookRepositoryDrizzle(kernel.db),
    permissionChecker: kernel.permissionChecker,
    logger: kernel.logger,
  });
};

const getCachedBookUseCases = createCachedFactory(() => buildBookUseCases());

export function getBookUseCases(options?: {
  overrides?: BookCompositionOverrides;
}) {
  if (options?.overrides && Object.keys(options.overrides).length > 0) {
    return buildBookUseCases(options.overrides);
  }
  return getCachedBookUseCases(false);
}
