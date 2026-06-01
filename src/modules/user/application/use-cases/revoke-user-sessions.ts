import { Result } from '@swan-io/boxed';

import {
  hasScopePermission,
  type RequestScope,
  scopeUserId,
} from '@/modules/auth';
import type { UserId } from '@/modules/kernel/domain/ids';

import type {
  UserResult,
  UserRevokeSessionsOutcome,
  UserUseCaseDeps,
} from './types';
import { isSelfTarget } from '../../domain/user-policy';

export type RevokeUserSessionsInput = {
  scope: RequestScope;
  id: UserId;
};

export async function revokeUserSessions(
  deps: UserUseCaseDeps,
  input: RevokeUserSessionsInput
): Promise<UserResult<UserRevokeSessionsOutcome>> {
  const currentUserId = scopeUserId(input.scope);
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { session: ['revoke'] },
  });
  if (allowed.isError()) return Result.Error(allowed.getError());
  if (allowed.get().type === 'permission_denied') {
    return Result.Ok({ type: 'user_forbidden' });
  }
  if (isSelfTarget(currentUserId, input.id)) {
    return Result.Ok({ type: 'user_self' });
  }

  const result = await deps.userAuthGateway.revokeUserSessions(input.id);
  if (result.isError()) return Result.Error(result.getError());
  deps.logger.warn({
    details: {
      mode: 'all',
      revokedByUserId: currentUserId,
      targetUserId: input.id,
    },
    event: 'security.session_revoked',
  });
  return Result.Ok({ type: 'user_sessions_revoked' });
}
