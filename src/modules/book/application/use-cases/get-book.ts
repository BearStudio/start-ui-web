import { Result } from '@swan-io/boxed';

import { hasScopePermission, type RequestScope } from '@/modules/auth';
import type { BookId } from '@/modules/kernel/domain/ids';

import type { BookGetOutcome, BookResult, BookUseCaseDeps } from './types';

export type GetBookInput = {
  scope: RequestScope;
  id: BookId;
};

export async function getBook(
  deps: BookUseCaseDeps,
  input: GetBookInput
): Promise<BookResult<BookGetOutcome>> {
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { book: ['read'] },
  });
  if (allowed.isError()) return Result.Error(allowed.getError());
  if (allowed.get().type === 'permission_denied') {
    return Result.Ok({ type: 'book_forbidden' });
  }

  deps.logger.info({
    event: 'book.get',
    details: { bookId: input.id },
  });
  const result = await deps.bookRepository.getById(input.id);
  if (result.isError()) return Result.Error(result.getError());
  return Result.Ok(result.get());
}
