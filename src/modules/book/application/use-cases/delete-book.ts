import { Result } from '@swan-io/boxed';

import { hasScopePermission, type RequestScope } from '@/modules/auth';
import type { BookId } from '@/modules/kernel/domain/ids';

import type { BookDeleteOutcome, BookResult, BookUseCaseDeps } from './types';

export type DeleteBookInput = {
  scope: RequestScope;
  id: BookId;
};

export async function deleteBook(
  deps: BookUseCaseDeps,
  input: DeleteBookInput
): Promise<BookResult<BookDeleteOutcome>> {
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { book: ['delete'] },
  });
  if (allowed.isError()) return Result.Error(allowed.getError());
  if (allowed.get().type === 'permission_denied') {
    return Result.Ok({ type: 'book_forbidden' });
  }

  deps.logger.info({
    event: 'book.delete',
    details: { bookId: input.id },
  });
  const result = await deps.bookRepository.delete(input.id);
  if (result.isError()) return Result.Error(result.getError());
  return Result.Ok(result.get());
}
