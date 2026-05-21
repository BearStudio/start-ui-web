import type { GenreRepository } from '@/modules/genre/application/ports/genre-repository';
import { createGenreUseCases } from '@/modules/genre/factory';
import { GenreRepositoryDrizzle } from '@/modules/genre/infrastructure/drizzle/genre-repository-drizzle';

import { getKernel, type KernelOverrides } from './kernel';
import { hasDefinedOverrides } from './shared/overrides';
import { createCachedFactory } from './shared/singleton';

export type GenreCompositionOverrides = KernelOverrides & {
  genreRepository?: GenreRepository;
};

const buildGenreUseCases = (overrides?: GenreCompositionOverrides) => {
  const kernel = getKernel({ overrides });
  return createGenreUseCases({
    genreRepository:
      overrides?.genreRepository ?? new GenreRepositoryDrizzle(kernel.db),
    permissionChecker: kernel.permissionChecker,
    logger: kernel.logger,
  });
};

const getCachedGenreUseCases = createCachedFactory(() => buildGenreUseCases());

export function getGenreUseCases(options?: {
  overrides?: GenreCompositionOverrides;
}) {
  const overrides = options?.overrides;
  if (hasDefinedOverrides(overrides)) {
    return buildGenreUseCases(overrides);
  }
  return getCachedGenreUseCases(false);
}
