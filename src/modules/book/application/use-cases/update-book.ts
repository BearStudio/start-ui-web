import { hasScopePermission, type RequestScope } from '@/modules/auth';
import { fail, ok } from '@/modules/kernel';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import type { BookId } from '@/modules/kernel/domain/ids';

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
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { book: ['update'] },
  });
  if (!allowed) return fail('forbidden');

  try {
    deps.logger.info('book.update', { event: 'book.update', bookId: input.id });
    const value = await deps.bookRepository.update(
      input.id,
      normalizeBookWriteInput(input.book)
    );
    if (!value) return fail('not_found');
    return ok(value);
  } catch (error) {
    if (error instanceof AppError && error.category === 'conflict') {
      return fail('duplicate');
    }
    throw error;
  }
}
