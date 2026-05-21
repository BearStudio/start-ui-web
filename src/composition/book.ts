import type { BookRepository } from '@/modules/book/application/ports/book-repository';
import { createBookUseCases } from '@/modules/book/factory';
import { BookRepositoryDrizzle } from '@/modules/book/infrastructure/drizzle/book-repository-drizzle';

import { getKernel, type KernelOverrides } from './kernel';
import { hasDefinedOverrides } from './shared/overrides';
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
  const overrides = options?.overrides;
  if (hasDefinedOverrides(overrides)) {
    return buildBookUseCases(overrides);
  }
  return getCachedBookUseCases(false);
}
