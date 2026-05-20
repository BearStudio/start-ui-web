import type { BookId, UserId } from '@/modules/kernel/domain/ids';

import type { BookUseCaseDeps, UseCaseResult } from './types';
import type { BookListPage } from '../../domain/book';

export type ListBooksInput = {
  currentUserId: UserId;
  cursor?: BookId;
  limit: number;
  searchTerm: string;
};

export async function listBooks(
  deps: BookUseCaseDeps,
  input: ListBooksInput
): Promise<UseCaseResult<BookListPage, 'forbidden'>> {
  const allowed = await deps.permissionChecker.hasPermission(
    input.currentUserId,
    {
      book: ['read'],
    }
  );
  if (!allowed) return { ok: false, reason: 'forbidden' };

  deps.logger.info('book.list', { event: 'book.list' });
  const value = await deps.bookRepository.list({
    cursor: input.cursor,
    limit: input.limit,
    searchTerm: input.searchTerm,
  });
  return { ok: true, value };
}
