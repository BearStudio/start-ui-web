import { Result } from '@swan-io/boxed';

import { hasScopePermission, type RequestScope } from '@/modules/auth';
import type { SessionId, UserId } from '@/modules/kernel/domain/ids';

import type {
  UserResult,
  UserSessionsListOutcome,
  UserUseCaseDeps,
} from './types';

export type ListUserSessionsInput = {
  scope: RequestScope;
  userId: UserId;
  cursor?: SessionId;
  limit: number;
};

export async function listUserSessions(
  deps: UserUseCaseDeps,
  input: ListUserSessionsInput
): Promise<UserResult<UserSessionsListOutcome>> {
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { session: ['list'] },
  });
  if (allowed.isError()) return Result.Error(allowed.getError());
  if (allowed.get().type === 'permission_denied') {
    return Result.Ok({ type: 'user_forbidden' });
  }

  deps.logger.info({
    event: 'user.sessions.list',
    details: {
      userId: input.userId,
    },
  });
  const result = await deps.userRepository.listSessions({
    userId: input.userId,
    cursor: input.cursor,
    limit: input.limit,
  });
  if (result.isError()) return Result.Error(result.getError());
  return Result.Ok(result.get());
}
