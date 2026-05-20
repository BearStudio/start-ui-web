import { createBook } from './application/use-cases/create-book';
import { deleteBook } from './application/use-cases/delete-book';
import { getBook } from './application/use-cases/get-book';
import { listBooks } from './application/use-cases/list-books';
import type { BookUseCaseDeps } from './application/use-cases/types';
import { updateBook } from './application/use-cases/update-book';

export function createBookUseCases(deps: BookUseCaseDeps) {
  return {
    list: (input: Parameters<typeof listBooks>[1]) => listBooks(deps, input),
    get: (input: Parameters<typeof getBook>[1]) => getBook(deps, input),
    create: (input: Parameters<typeof createBook>[1]) =>
      createBook(deps, input),
    update: (input: Parameters<typeof updateBook>[1]) =>
      updateBook(deps, input),
    delete: (input: Parameters<typeof deleteBook>[1]) =>
      deleteBook(deps, input),
  };
}

export type BookUseCases = ReturnType<typeof createBookUseCases>;
