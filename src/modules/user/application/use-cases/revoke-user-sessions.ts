import { AppError } from '@/modules/kernel/domain/errors/app-error';
import type { UserId } from '@/modules/kernel/domain/ids';

import type { UseCaseResult, UserUseCaseDeps } from './types';
import { isSelfTarget } from '../../domain/user-policy';

export type RevokeUserSessionsInput = {
  currentUserId: UserId;
  id: UserId;
};

export async function revokeUserSessions(
  deps: UserUseCaseDeps,
  input: RevokeUserSessionsInput
): Promise<UseCaseResult<void, 'forbidden' | 'self'>> {
  const allowed = await deps.permissionChecker.hasPermission(
    input.currentUserId,
    {
      session: ['revoke'],
    }
  );
  if (!allowed) return { ok: false, reason: 'forbidden' };
  if (isSelfTarget(input.currentUserId, input.id)) {
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
