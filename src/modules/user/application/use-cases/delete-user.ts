import {
  hasScopePermission,
  type RequestScope,
  scopeUserId,
} from '@/modules/auth';
import { fail, ok } from '@/modules/kernel';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import type { UserId } from '@/modules/kernel/domain/ids';

import type { UseCaseResult, UserUseCaseDeps } from './types';
import { isSelfTarget } from '../../domain/user-policy';

export type DeleteUserInput = {
  scope: RequestScope;
  id: UserId;
};

export async function deleteUser(
  deps: UserUseCaseDeps,
  input: DeleteUserInput
): Promise<UseCaseResult<void, 'forbidden' | 'self'>> {
  const currentUserId = scopeUserId(input.scope);
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { user: ['delete'] },
  });
  if (!allowed) return fail('forbidden');
  if (isSelfTarget(currentUserId, input.id)) {
    return fail('self');
  }

  deps.logger.info({
    event: 'user.delete',
    details: { userId: input.id },
  });
  const removed = await deps.userAuthGateway.removeUser(input.id);
  if (!removed) {
    throw new AppError({
      code: 'USER_DELETE_FAILED',
      category: 'system',
      status: 500,
      message: 'Failed to delete user',
    });
  }
  return ok(undefined);
}
