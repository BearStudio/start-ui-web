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

export type RevokeUserSessionsInput = {
  scope: RequestScope;
  id: UserId;
};

export async function revokeUserSessions(
  deps: UserUseCaseDeps,
  input: RevokeUserSessionsInput
): Promise<UseCaseResult<void, 'forbidden' | 'self'>> {
  const currentUserId = scopeUserId(input.scope);
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { session: ['revoke'] },
  });
  if (!allowed) return fail('forbidden');
  if (isSelfTarget(currentUserId, input.id)) {
    return fail('self');
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
  deps.logger.warn({
    details: {
      mode: 'all',
      revokedByUserId: currentUserId,
      targetUserId: input.id,
    },
    event: 'security.session_revoked',
  });
  return ok(undefined);
}
