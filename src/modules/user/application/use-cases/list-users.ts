import { Result } from '@swan-io/boxed';

import { hasScopePermission, type RequestScope } from '@/modules/auth';
import type { UserId } from '@/modules/kernel/domain/ids';

import type { UserListOutcome, UserResult, UserUseCaseDeps } from './types';

export type ListUsersInput = {
  scope: RequestScope;
  cursor?: UserId;
  limit: number;
  searchTerm: string;
};

export async function listUsers(
  deps: UserUseCaseDeps,
  input: ListUsersInput
): Promise<UserResult<UserListOutcome>> {
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { user: ['list'] },
  });
  if (allowed.isError()) return Result.Error(allowed.getError());
  if (allowed.get().type === 'permission_denied') {
    return Result.Ok({ type: 'user_forbidden' });
  }

  deps.logger.info({ event: 'user.list' });
  const result = await deps.userRepository.list({
    cursor: input.cursor,
    limit: input.limit,
    searchTerm: input.searchTerm,
  });
  if (result.isError()) return Result.Error(result.getError());
  return Result.Ok(result.get());
}
