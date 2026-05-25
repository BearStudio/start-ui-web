import { hasScopePermission, type RequestScope } from '@/modules/auth';
import { fail, ok } from '@/modules/kernel';
import type { BookId } from '@/modules/kernel/domain/ids';

import type { BookUseCaseDeps, UseCaseResult } from './types';

export type DeleteBookInput = {
  scope: RequestScope;
  id: BookId;
};

export async function deleteBook(
  deps: BookUseCaseDeps,
  input: DeleteBookInput
): Promise<UseCaseResult<void, 'forbidden' | 'not_found'>> {
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { book: ['delete'] },
  });
  if (!allowed) return fail('forbidden');

  deps.logger.info('book.delete', { event: 'book.delete', bookId: input.id });
  const deleted = await deps.bookRepository.delete(input.id);
  if (!deleted) return fail('not_found');
  return ok(undefined);
}
