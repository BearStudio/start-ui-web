import { Result } from '@swan-io/boxed';

import type { UserId } from '@/modules/kernel/domain/ids';

import type { BookCreateOutcome, BookResult, BookUseCaseDeps } from './types';
import type { BookWriteInput } from '../../domain/book';
import { normalizeBookWriteInput } from '../../domain/book';

export type CreateBookInput = {
  currentUserId: UserId;
  book: BookWriteInput;
};

export async function createBook(
  deps: BookUseCaseDeps,
  input: CreateBookInput
): Promise<BookResult<BookCreateOutcome>> {
  const allowed = await deps.permissionChecker.hasPermission(
    input.currentUserId,
    { book: ['create'] }
  );
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
