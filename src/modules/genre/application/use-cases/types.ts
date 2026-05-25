import type { Logger } from '@/modules/kernel/application/ports/logger';
import type { PermissionChecker } from '@/modules/kernel/application/ports/permission-checker';
import type { UseCaseResult } from '@/modules/kernel/application/result';

import type { GenreRepository } from '../ports/genre-repository';

export type GenreUseCaseDeps = {
  genreRepository: GenreRepository;
  permissionChecker: PermissionChecker;
  logger: Logger;
};

export type { UseCaseResult };
