import { hasScopePermission, type RequestScope } from '@/modules/auth';
import { fail, ok } from '@/modules/kernel';
import { AppError } from '@/modules/kernel/domain/errors/app-error';

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
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { book: ['create'] },
  });
  if (!allowed) return fail('forbidden');

  try {
    deps.logger.info('book.create', { event: 'book.create' });
    const value = await deps.bookRepository.create(
      normalizeBookWriteInput(input.book)
    );
    return ok(value);
  } catch (error) {
    if (error instanceof AppError && error.category === 'conflict') {
      return fail('duplicate');
    }
    throw error;
  }
}
