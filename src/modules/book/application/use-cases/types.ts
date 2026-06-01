import type {
  ApplicationResult,
  IdGenerator,
  Logger,
  PermissionChecker,
  TransactionRunner,
} from '@/modules/kernel';
import type { BookCoverObjectKey } from '@/modules/kernel/domain/ids';

import type {
  BookCreateRepositoryOutcome,
  BookDeleteRepositoryOutcome,
  BookGetRepositoryOutcome,
  BookListRepositoryOutcome,
  BookRepository,
  BookUpdateRepositoryOutcome,
} from '../ports/book-repository';

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

export type BookForbiddenOutcome = { type: 'book_forbidden' };

export type BookListOutcome = BookListRepositoryOutcome | BookForbiddenOutcome;

export type BookGetOutcome = BookGetRepositoryOutcome | BookForbiddenOutcome;

export type BookCreateOutcome =
  | BookCreateRepositoryOutcome
  | BookForbiddenOutcome;

export type BookUpdateOutcome =
  | BookUpdateRepositoryOutcome
  | BookForbiddenOutcome;

export type BookDeleteOutcome =
  | BookDeleteRepositoryOutcome
  | BookForbiddenOutcome;

export type PreparedBookCoverUpload = {
  objectKey: BookCoverObjectKey;
};

export type BookCoverUploadOutcome =
  | { type: 'book_cover_upload_prepared'; upload: PreparedBookCoverUpload }
  | { type: 'book_cover_upload_forbidden' }
  | { type: 'book_cover_upload_invalid_file_type' };

export type BookResult<TOutcome> = ApplicationResult<TOutcome>;
