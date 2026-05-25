import type { Logger } from '@/modules/kernel/application/ports/logger';
import type { PermissionChecker } from '@/modules/kernel/application/ports/permission-checker';
import type { UseCaseResult } from '@/modules/kernel/application/result';

import type { BookRepository } from '../ports/book-repository';

export type BookUseCaseDeps = {
  bookRepository: BookRepository;
  permissionChecker: PermissionChecker;
  logger: Logger;
};

export type { UseCaseResult };
