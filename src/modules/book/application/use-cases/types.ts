import type {
  IdGenerator,
  Logger,
  PermissionChecker,
  TransactionRunner,
  UseCaseResult,
} from '@/modules/kernel';

import type { BookRepository } from '../ports/book-repository';

export type BookTransactionContext = {
  bookRepository: BookRepository;
};

export type BookUseCaseDeps = {
  bookRepository: BookRepository;
  transactionRunner: TransactionRunner<BookTransactionContext>;
  idGenerator: IdGenerator;
  permissionChecker: PermissionChecker;
  logger: Logger;
};

export type { UseCaseResult };
