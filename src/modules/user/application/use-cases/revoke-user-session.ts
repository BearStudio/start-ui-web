import { AppError } from '@/modules/kernel/domain/errors/app-error';
import type { SessionId, UserId } from '@/modules/kernel/domain/ids';

import type { UseCaseResult, UserUseCaseDeps } from './types';

export type RevokeUserSessionInput = {
  currentUserId: UserId;
  currentSessionId: SessionId;
  id: UserId;
  sessionId: SessionId;
};

export async function revokeUserSession(
  deps: UserUseCaseDeps,
  input: RevokeUserSessionInput
): Promise<UseCaseResult<void, 'forbidden' | 'not_found' | 'self'>> {
  const allowed = await deps.permissionChecker.hasPermission(
    input.currentUserId,
    {
      session: ['revoke'],
    }
  );
  if (!allowed) return { ok: false, reason: 'forbidden' };

  const targetSession = await deps.userRepository.findSessionForRevocation({
    userId: input.id,
    sessionId: input.sessionId,
  });
  if (!targetSession) return { ok: false, reason: 'not_found' };
  if (input.currentSessionId === targetSession.id) {
    return { ok: false, reason: 'self' };
  }

  const revoked = await deps.userAuthGateway.revokeUserSession(
    targetSession.token
  );
  if (!revoked) {
    throw new AppError({
      code: 'USER_SESSION_REVOKE_FAILED',
      category: 'system',
      status: 500,
      message: 'Failed to revoke user session',
    });
  }
  return { ok: true, value: undefined };
}
