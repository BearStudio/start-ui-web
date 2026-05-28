import { hasScopePermission, type RequestScope } from '@/modules/auth';
import { fail, ok } from '@/modules/kernel';
import type { UserId } from '@/modules/kernel/domain/ids';

import type { UseCaseResult, UserUseCaseDeps } from './types';
import type { UserListPage } from '../../domain/user';

export type ListUsersInput = {
  scope: RequestScope;
  cursor?: UserId;
  limit: number;
  searchTerm: string;
};

export async function listUsers(
  deps: UserUseCaseDeps,
  input: ListUsersInput
): Promise<UseCaseResult<UserListPage, 'forbidden'>> {
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { user: ['list'] },
  });
  if (!allowed) return fail('forbidden');

  deps.logger.info({ event: 'user.list' });
  const value = await deps.userRepository.list({
    cursor: input.cursor,
    limit: input.limit,
    searchTerm: input.searchTerm,
  });
  return ok(value);
}
