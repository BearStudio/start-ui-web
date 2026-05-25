import type { RequestScope } from '@/modules/auth';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import type { UserId } from '@/modules/kernel/domain/ids';
import { toUserId } from '@/modules/kernel/domain/ids';

import type { UseCaseResult, UserUseCaseDeps } from './types';
import { isSelfTarget } from '../../domain/user-policy';

export type RevokeUserSessionsInput = {
  scope: RequestScope;
  id: UserId;
};

export async function revokeUserSessions(
  deps: UserUseCaseDeps,
  input: RevokeUserSessionsInput
): Promise<UseCaseResult<void, 'forbidden' | 'self'>> {
  const currentUserId = toUserId(input.scope.userId);
  const allowed = await deps.permissionChecker.hasPermission(currentUserId, {
    session: ['revoke'],
  });
  if (!allowed) return { ok: false, reason: 'forbidden' };
  if (isSelfTarget(currentUserId, input.id)) {
    return { ok: false, reason: 'self' };
  }

  const revoked = await deps.userAuthGateway.revokeUserSessions(input.id);
  if (!revoked) {
    throw new AppError({
      code: 'USER_SESSIONS_REVOKE_FAILED',
      category: 'system',
      status: 500,
      message: 'Failed to revoke user sessions',
    });
  }
  return { ok: true, value: undefined };
}
