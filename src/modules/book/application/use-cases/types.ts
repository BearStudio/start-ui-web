import type { IdGenerator } from '@/modules/kernel/application/ports/id-generator';
import type { Logger } from '@/modules/kernel/application/ports/logger';
import type { PermissionChecker } from '@/modules/kernel/application/ports/permission-checker';
import type { TransactionRunner } from '@/modules/kernel/application/ports/transaction-runner';
import type { UseCaseResult } from '@/modules/kernel/application/result';

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
