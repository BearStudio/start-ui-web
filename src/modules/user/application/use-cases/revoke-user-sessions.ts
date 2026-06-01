import { Result } from '@swan-io/boxed';
import { match, P } from 'ts-pattern';

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
  const permission = match(allowed)
    .with(Result.P.Error(P.select()), (error) => ({
      type: 'error' as const,
      error,
    }))
    .with(Result.P.Ok({ type: 'permission_denied' }), () => ({
      type: 'denied' as const,
    }))
    .with(Result.P.Ok({ type: 'permission_granted' }), () => ({
      type: 'granted' as const,
    }))
    .exhaustive();
  if (permission.type === 'error') return Result.Error(permission.error);
  if (permission.type === 'denied') {
    return Result.Ok({ type: 'user_forbidden' });
  }
  if (isSelfTarget(currentUserId, input.id)) {
    return Result.Ok({ type: 'user_self' });
  }

  const result = await deps.userAuthGateway.revokeUserSessions(input.id);
  const revoked = match(result)
    .with(Result.P.Error(P.select()), (error) => ({
      type: 'error' as const,
      error,
    }))
    .with(Result.P.Ok({ type: 'user_auth_sessions_revoked' }), () => ({
      type: 'revoked' as const,
    }))
    .exhaustive();
  if (revoked.type === 'error') return Result.Error(revoked.error);
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
