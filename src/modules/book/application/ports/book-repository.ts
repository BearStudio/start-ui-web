import type { ApplicationResult } from '@/modules/kernel/application/result';
import type { BookId } from '@/modules/kernel/domain/ids';

import type { Book, BookListPage, BookWriteInput } from '../../domain/book';

export type BookListRepositoryOutcome = {
  type: 'book_listed';
  page: BookListPage;
};

export type BookGetRepositoryOutcome =
  | { type: 'book_found'; book: Book }
  | { type: 'book_not_found' };

export type BookCreateRepositoryOutcome =
  | { type: 'book_created'; book: Book }
  | { type: 'book_duplicate' };

export type BookUpdateRepositoryOutcome =
  | { type: 'book_updated'; book: Book }
  | { type: 'book_not_found' }
  | { type: 'book_duplicate' };

export type BookDeleteRepositoryOutcome =
  | { type: 'book_deleted' }
  | { type: 'book_not_found' };

export interface BookRepository {
  list(input: {
    cursor?: BookId;
    limit: number;
    searchTerm: string;
  }): Promise<ApplicationResult<BookListRepositoryOutcome>>;
  getById(id: BookId): Promise<ApplicationResult<BookGetRepositoryOutcome>>;
  create(
    input: BookWriteInput
  ): Promise<ApplicationResult<BookCreateRepositoryOutcome>>;
  update(
    id: BookId,
    input: BookWriteInput
  ): Promise<ApplicationResult<BookUpdateRepositoryOutcome>>;
  delete(id: BookId): Promise<ApplicationResult<BookDeleteRepositoryOutcome>>;
}
