import type { RequestScope } from '@/modules/auth';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import { toUserId } from '@/modules/kernel/domain/ids';

import type { BookUseCaseDeps, UseCaseResult } from './types';
import type { Book, BookWriteInput } from '../../domain/book';
import { normalizeBookWriteInput } from '../../domain/book';

export type CreateBookInput = {
  scope: RequestScope;
  book: BookWriteInput;
};

export async function createBook(
  deps: BookUseCaseDeps,
  input: CreateBookInput
): Promise<UseCaseResult<Book, 'forbidden' | 'duplicate'>> {
  const currentUserId = toUserId(input.scope.userId);
  const allowed = await deps.permissionChecker.hasPermission(currentUserId, {
    book: ['create'],
  });
  if (!allowed) return { ok: false, reason: 'forbidden' };

  try {
    deps.logger.info('book.create', { event: 'book.create' });
    const value = await deps.bookRepository.create(
      normalizeBookWriteInput(input.book)
    );
    return { ok: true, value };
  } catch (error) {
    if (error instanceof AppError && error.category === 'conflict') {
      return { ok: false, reason: 'duplicate' };
    }
    throw error;
  }
}
