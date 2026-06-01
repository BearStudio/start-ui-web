import { createGenreUseCases, type GenreRepository } from '@/modules/genre';
import { createGenreRepository } from '@/modules/genre/infrastructure/drizzle/genre-repository-drizzle';

import { getKernel, type Kernel } from './kernel';
import { createCachedFactory } from './shared/singleton';

export type GenreOverrides = {
  kernel?: Kernel;
  genreRepository?: GenreRepository;
};

const buildGenreUseCases = (overrides?: GenreOverrides) => {
  const kernel = overrides?.kernel ?? getKernel();
  return createGenreUseCases({
    genreRepository:
      overrides?.genreRepository ?? createGenreRepository({ db: kernel.db }),
    permissionChecker: kernel.permissionChecker,
    logger: kernel.logger,
  });
};

const factory = createCachedFactory(buildGenreUseCases);

export const getGenreUseCases = (overrides?: GenreOverrides) =>
  factory.get(overrides);

/** Test-only. */
export const __resetGenreComposition = () => factory.reset();
