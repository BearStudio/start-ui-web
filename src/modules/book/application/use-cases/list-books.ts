import { Result } from '@swan-io/boxed';

import type { BookId, UserId } from '@/modules/kernel/domain/ids';

import type { BookListOutcome, BookResult, BookUseCaseDeps } from './types';

export type ListBooksInput = {
  currentUserId: UserId;
  cursor?: BookId;
  limit: number;
  searchTerm: string;
};

export async function listBooks(
  deps: BookUseCaseDeps,
  input: ListBooksInput
): Promise<BookResult<BookListOutcome>> {
  const allowed = await deps.permissionChecker.hasPermission(
    input.currentUserId,
    { book: ['read'] }
  );
  if (allowed.isError()) return Result.Error(allowed.getError());
  if (allowed.get().type === 'permission_denied') {
    return Result.Ok({ type: 'book_forbidden' });
  }

  deps.logger.info({ event: 'book.list' });
  const result = await deps.bookRepository.list({
    cursor: input.cursor,
    limit: input.limit,
    searchTerm: input.searchTerm,
  });
  if (result.isError()) return Result.Error(result.getError());
  return Result.Ok(result.get());
}
