import type { Logger } from '@/modules/kernel/application/ports/logger';
import type { PermissionChecker } from '@/modules/kernel/application/ports/permission-checker';
import type { ApplicationResult } from '@/modules/kernel/application/result';

import type {
  GenreListRepositoryOutcome,
  GenreRepository,
} from '../ports/genre-repository';

export type GenreUseCaseDeps = {
  genreRepository: GenreRepository;
  permissionChecker: PermissionChecker;
  logger: Logger;
};

export type GenreListOutcome =
  | GenreListRepositoryOutcome
  | { type: 'genre_forbidden' };

export type GenreResult<TOutcome> = ApplicationResult<TOutcome>;
