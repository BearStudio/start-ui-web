import type { BookId, UserId } from '@/modules/kernel/domain/ids';

import type { BookUseCaseDeps, UseCaseResult } from './types';
import type { Book } from '../../domain/book';

export type GetBookInput = {
  currentUserId: UserId;
  id: BookId;
};

export async function getBook(
  deps: BookUseCaseDeps,
  input: GetBookInput
): Promise<UseCaseResult<Book, 'forbidden' | 'not_found'>> {
  const allowed = await deps.permissionChecker.hasPermission(
    input.currentUserId,
    {
      book: ['read'],
    }
  );
  if (!allowed) return { ok: false, reason: 'forbidden' };

  deps.logger.info('book.get', { event: 'book.get', bookId: input.id });
  const value = await deps.bookRepository.getById(input.id);
  if (!value) return { ok: false, reason: 'not_found' };
  return { ok: true, value };
}
