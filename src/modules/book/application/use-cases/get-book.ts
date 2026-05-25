import type { RequestScope } from '@/modules/auth';
import type { BookId } from '@/modules/kernel/domain/ids';
import { toUserId } from '@/modules/kernel/domain/ids';

import type { BookUseCaseDeps, UseCaseResult } from './types';
import type { Book } from '../../domain/book';

export type GetBookInput = {
  scope: RequestScope;
  id: BookId;
};

export async function getBook(
  deps: BookUseCaseDeps,
  input: GetBookInput
): Promise<UseCaseResult<Book, 'forbidden' | 'not_found'>> {
  const currentUserId = toUserId(input.scope.userId);
  const allowed = await deps.permissionChecker.hasPermission(currentUserId, {
    book: ['read'],
  });
  if (!allowed) return { ok: false, reason: 'forbidden' };

  deps.logger.info('book.get', { event: 'book.get', bookId: input.id });
  const value = await deps.bookRepository.getById(input.id);
  if (!value) return { ok: false, reason: 'not_found' };
  return { ok: true, value };
}
