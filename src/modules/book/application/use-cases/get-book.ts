import { Result } from '@swan-io/boxed';

import type { BookId, UserId } from '@/modules/kernel/domain/ids';

import type { BookGetOutcome, BookResult, BookUseCaseDeps } from './types';

export type GetBookInput = {
  currentUserId: UserId;
  id: BookId;
};

export async function getBook(
  deps: BookUseCaseDeps,
  input: GetBookInput
): Promise<BookResult<BookGetOutcome>> {
  const allowed = await deps.permissionChecker.hasPermission(
    input.currentUserId,
    { book: ['read'] }
  );
  if (allowed.isError()) return Result.Error(allowed.getError());
  if (allowed.get().type === 'permission_denied') {
    return Result.Ok({ type: 'book_forbidden' });
  }

  deps.logger.info({
    event: 'book.get',
    details: { bookId: input.id },
  });
  const result = await deps.bookRepository.getById(input.id);
  if (result.isError()) return Result.Error(result.getError());
  return Result.Ok(result.get());
}
