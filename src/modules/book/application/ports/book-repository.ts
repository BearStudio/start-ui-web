import type { BookId } from '@/modules/kernel/domain/ids';

import type { Book, BookListPage, BookWriteInput } from '../../domain/book';

export interface BookRepository {
  list(input: {
    cursor?: BookId;
    limit: number;
    searchTerm: string;
  }): Promise<BookListPage>;
  getById(id: BookId): Promise<Book | null>;
  create(input: BookWriteInput): Promise<Book>;
  update(id: BookId, input: BookWriteInput): Promise<Book | null>;
  delete(id: BookId): Promise<boolean>;
}
