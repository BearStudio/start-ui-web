import { Result } from '@swan-io/boxed';

import type { BookId, UserId } from '@/modules/kernel/domain/ids';

import type { BookDeleteOutcome, BookResult, BookUseCaseDeps } from './types';

export type DeleteBookInput = {
  currentUserId: UserId;
  id: BookId;
};

export async function deleteBook(
  deps: BookUseCaseDeps,
  input: DeleteBookInput
): Promise<BookResult<BookDeleteOutcome>> {
  const allowed = await deps.permissionChecker.hasPermission(
    input.currentUserId,
    { book: ['delete'] }
  );
  if (allowed.isError()) return Result.Error(allowed.getError());
  if (allowed.get().type === 'permission_denied') {
    return Result.Ok({ type: 'book_forbidden' });
  }

  deps.logger.info({
    event: 'book.delete',
    details: { bookId: input.id },
  });
  const result = await deps.bookRepository.delete(input.id);
  if (result.isError()) return Result.Error(result.getError());
  return Result.Ok(result.get());
}
