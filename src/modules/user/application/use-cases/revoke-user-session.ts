import { Result } from '@swan-io/boxed';
import { match, P } from 'ts-pattern';

import type { SessionId, UserId } from '@/modules/kernel/domain/ids';

import type {
  UserResult,
  UserRevokeSessionOutcome,
  UserUseCaseDeps,
} from './types';

export type RevokeUserSessionInput = {
  currentUserId: UserId;
  currentSessionId: SessionId;
  id: UserId;
  sessionId: SessionId;
};

export async function revokeUserSession(
  deps: UserUseCaseDeps,
  input: RevokeUserSessionInput
): Promise<UserResult<UserRevokeSessionOutcome>> {
  const allowed = await deps.permissionChecker.hasPermission(
    input.currentUserId,
    { session: ['revoke'] }
  );
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

  const targetResult = await deps.userRepository.findSessionForRevocation({
    userId: input.id,
    sessionId: input.sessionId,
  });
  const target = match(targetResult)
    .with(Result.P.Error(P.select()), (error) => ({
      type: 'error' as const,
      error,
    }))
    .with(Result.P.Ok({ type: 'user_session_not_found' }), () => ({
      type: 'not-found' as const,
    }))
    .with(
      Result.P.Ok({
        type: 'user_session_revocation_target_found',
        target: P.select(),
      }),
      (session) => ({ type: 'found' as const, session })
    )
    .exhaustive();
  if (target.type === 'error') return Result.Error(target.error);
  if (target.type === 'not-found') {
    return Result.Ok({ type: 'user_session_not_found' });
  }
  const targetSession = target.session;
  if (input.currentSessionId === targetSession.id) {
    return Result.Ok({ type: 'user_self' });
  }

  const result = await deps.userAuthGateway.revokeUserSession({
    userId: input.id,
    sessionId: targetSession.id,
  });
  const revoked = match(result)
    .with(Result.P.Error(P.select()), (error) => ({
      type: 'error' as const,
      error,
    }))
    .with(Result.P.Ok({ type: 'user_auth_session_revoked' }), () => ({
      type: 'revoked' as const,
    }))
    .exhaustive();
  if (revoked.type === 'error') return Result.Error(revoked.error);
  deps.logger.warn({
    details: {
      mode: 'single',
      targetUserId: input.id,
    },
    event: 'security.session_revoked',
  });
  return Result.Ok({ type: 'user_session_revoked' });
}
