import { Result } from '@swan-io/boxed';

import {
  hasScopePermission,
  type RequestScope,
  scopeUserId,
} from '@/modules/auth';
import type { UserId } from '@/modules/kernel/domain/ids';

import type { UserDeleteOutcome, UserResult, UserUseCaseDeps } from './types';
import { isSelfTarget } from '../../domain/user-policy';

export type DeleteUserInput = {
  scope: RequestScope;
  id: UserId;
};

export async function deleteUser(
  deps: UserUseCaseDeps,
  input: DeleteUserInput
): Promise<UserResult<UserDeleteOutcome>> {
  const currentUserId = scopeUserId(input.scope);
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { user: ['delete'] },
  });
  if (allowed.isError()) return Result.Error(allowed.getError());
  if (allowed.get().type === 'permission_denied') {
    return Result.Ok({ type: 'user_forbidden' });
  }
  if (isSelfTarget(currentUserId, input.id)) {
    return Result.Ok({ type: 'user_self' });
  }

  deps.logger.info({
    event: 'user.delete',
    details: { userId: input.id },
  });
  const result = await deps.userAuthGateway.removeUser(input.id);
  if (result.isError()) return Result.Error(result.getError());
  return Result.Ok({ type: 'user_deleted' });
}
