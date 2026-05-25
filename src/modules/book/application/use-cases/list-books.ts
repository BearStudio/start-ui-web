import type { RequestScope } from '@/modules/auth';
import type { BookId } from '@/modules/kernel/domain/ids';
import { toUserId } from '@/modules/kernel/domain/ids';

import type { BookUseCaseDeps, UseCaseResult } from './types';
import type { BookListPage } from '../../domain/book';

export type ListBooksInput = {
  scope: RequestScope;
  cursor?: BookId;
  limit: number;
  searchTerm: string;
};

export async function listBooks(
  deps: BookUseCaseDeps,
  input: ListBooksInput
): Promise<UseCaseResult<BookListPage, 'forbidden'>> {
  const currentUserId = toUserId(input.scope.userId);
  const allowed = await deps.permissionChecker.hasPermission(currentUserId, {
    book: ['read'],
  });
  if (!allowed) return { ok: false, reason: 'forbidden' };

  deps.logger.info('book.list', { event: 'book.list' });
  const value = await deps.bookRepository.list({
    cursor: input.cursor,
    limit: input.limit,
    searchTerm: input.searchTerm,
  });
  return { ok: true, value };
}
