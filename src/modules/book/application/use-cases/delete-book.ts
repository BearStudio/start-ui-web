import type { BookId, UserId } from '@/modules/kernel/domain/ids';

import type { BookUseCaseDeps, UseCaseResult } from './types';

export type DeleteBookInput = {
  currentUserId: UserId;
  id: BookId;
};

export async function deleteBook(
  deps: BookUseCaseDeps,
  input: DeleteBookInput
): Promise<UseCaseResult<void, 'forbidden' | 'not_found'>> {
  const allowed = await deps.permissionChecker.hasPermission(
    input.currentUserId,
    {
      book: ['delete'],
    }
  );
  if (!allowed) return { ok: false, reason: 'forbidden' };

  deps.logger.info('book.delete', { event: 'book.delete', bookId: input.id });
  const deleted = await deps.bookRepository.delete(input.id);
  if (!deleted) return { ok: false, reason: 'not_found' };
  return { ok: true, value: undefined };
}
