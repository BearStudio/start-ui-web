import { hasScopePermission, type RequestScope } from '@/modules/auth';
import { fail, ok } from '@/modules/kernel';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import type { SessionId, UserId } from '@/modules/kernel/domain/ids';

import type { UseCaseResult, UserUseCaseDeps } from './types';

export type RevokeUserSessionInput = {
  scope: RequestScope;
  currentSessionId: SessionId;
  id: UserId;
  sessionId: SessionId;
};

export async function revokeUserSession(
  deps: UserUseCaseDeps,
  input: RevokeUserSessionInput
): Promise<UseCaseResult<void, 'forbidden' | 'not_found' | 'self'>> {
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { session: ['revoke'] },
  });
  if (!allowed) return fail('forbidden');

  const targetSession = await deps.userRepository.findSessionForRevocation({
    userId: input.id,
    sessionId: input.sessionId,
  });
  if (!targetSession) return fail('not_found');
  if (input.currentSessionId === targetSession.id) {
    return fail('self');
  }

  const revoked = await deps.userAuthGateway.revokeUserSession(targetSession);
  if (!revoked) {
    throw new AppError({
      code: 'USER_SESSION_REVOKE_FAILED',
      category: 'system',
      status: 500,
      message: 'Failed to revoke user session',
    });
  }
  deps.logger.warn({
    details: {
      mode: 'single',
      targetUserId: input.id,
    },
    event: 'security.session_revoked',
  });
  return ok(undefined);
}
