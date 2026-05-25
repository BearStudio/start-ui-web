import type { RequestScope } from '@/modules/auth';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import type { UserId } from '@/modules/kernel/domain/ids';
import { toUserId } from '@/modules/kernel/domain/ids';

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
  const currentUserId = toUserId(input.scope.userId);
  const allowed = await deps.permissionChecker.hasPermission(currentUserId, {
    user: ['delete'],
  });
  if (!allowed) return { ok: false, reason: 'forbidden' };
  if (isSelfTarget(currentUserId, input.id)) {
    return { ok: false, reason: 'self' };
  }

  deps.logger.info('user.delete', { event: 'user.delete', userId: input.id });
  const removed = await deps.userAuthGateway.removeUser(input.id);
  if (!removed) {
    throw new AppError({
      code: 'USER_DELETE_FAILED',
      category: 'system',
      status: 500,
      message: 'Failed to delete user',
    });
  }
  return { ok: true, value: undefined };
}
