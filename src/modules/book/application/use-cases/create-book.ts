import { Result } from '@swan-io/boxed';

import { hasScopePermission, type RequestScope } from '@/modules/auth';

import type { BookCreateOutcome, BookResult, BookUseCaseDeps } from './types';
import type { BookWriteInput } from '../../domain/book';
import { normalizeBookWriteInput } from '../../domain/book';

export type CreateBookInput = {
  scope: RequestScope;
  book: BookWriteInput;
};

export async function createBook(
  deps: BookUseCaseDeps,
  input: CreateBookInput
): Promise<BookResult<BookCreateOutcome>> {
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { book: ['create'] },
  });
  if (allowed.isError()) return Result.Error(allowed.getError());
  if (allowed.get().type === 'permission_denied') {
    return Result.Ok({ type: 'book_forbidden' });
  }

  deps.logger.info({ event: 'book.create' });
  const result = await deps.bookRepository.create(
    normalizeBookWriteInput(input.book)
  );
  if (result.isError()) return Result.Error(result.getError());
  return Result.Ok(result.get());
}
