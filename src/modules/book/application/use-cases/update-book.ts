import type { RequestScope } from '@/modules/auth';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import type { BookId } from '@/modules/kernel/domain/ids';
import { toUserId } from '@/modules/kernel/domain/ids';

import type { BookUseCaseDeps, UseCaseResult } from './types';
import type { Book, BookWriteInput } from '../../domain/book';
import { normalizeBookWriteInput } from '../../domain/book';

export type UpdateBookInput = {
  scope: RequestScope;
  id: BookId;
  book: BookWriteInput;
};

export async function updateBook(
  deps: BookUseCaseDeps,
  input: UpdateBookInput
): Promise<UseCaseResult<Book, 'forbidden' | 'not_found' | 'duplicate'>> {
  const currentUserId = toUserId(input.scope.userId);
  const allowed = await deps.permissionChecker.hasPermission(currentUserId, {
    book: ['update'],
  });
  if (!allowed) return { ok: false, reason: 'forbidden' };

  try {
    deps.logger.info('book.update', { event: 'book.update', bookId: input.id });
    const value = await deps.bookRepository.update(
      input.id,
      normalizeBookWriteInput(input.book)
    );
    if (!value) return { ok: false, reason: 'not_found' };
    return { ok: true, value };
  } catch (error) {
    if (error instanceof AppError && error.category === 'conflict') {
      return { ok: false, reason: 'duplicate' };
    }
    throw error;
  }
}
