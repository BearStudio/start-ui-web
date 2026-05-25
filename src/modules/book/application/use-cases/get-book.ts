import { hasScopePermission, type RequestScope } from '@/modules/auth';
import { fail, ok } from '@/modules/kernel';
import type { BookId } from '@/modules/kernel/domain/ids';

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
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { book: ['read'] },
  });
  if (!allowed) return fail('forbidden');

  deps.logger.info('book.get', { event: 'book.get', bookId: input.id });
  const value = await deps.bookRepository.getById(input.id);
  if (!value) return fail('not_found');
  return ok(value);
}
