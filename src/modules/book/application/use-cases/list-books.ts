import { hasScopePermission, type RequestScope } from '@/modules/auth';
import { fail, ok } from '@/modules/kernel';
import type { BookId } from '@/modules/kernel/domain/ids';

import type { BookUseCaseDeps, UseCaseResult } from './types';
import type { BookListPage } from '../../domain/book';

export type ListBooksInput = {
  scope: RequestScope;
  cursor?: BookId;
  limit: number;
  searchTerm: string;
};

export async function listBooks(
  deps: BookUseCaseDeps,
  input: ListBooksInput
): Promise<UseCaseResult<BookListPage, 'forbidden'>> {
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { book: ['read'] },
  });
  if (!allowed) return fail('forbidden');

  deps.logger.info({ event: 'book.list' });
  const value = await deps.bookRepository.list({
    cursor: input.cursor,
    limit: input.limit,
    searchTerm: input.searchTerm,
  });
  return ok(value);
}
