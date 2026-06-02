import { Result } from '@swan-io/boxed';

import type { SessionId, UserId } from '@/modules/kernel/domain/ids';

import type {
  UserResult,
  UserSessionsListOutcome,
  UserUseCaseDeps,
} from './types';

export type ListUserSessionsInput = {
  currentUserId: UserId;
  userId: UserId;
  cursor?: SessionId;
  limit: number;
};

export async function listUserSessions(
  deps: UserUseCaseDeps,
  input: ListUserSessionsInput
): Promise<UserResult<UserSessionsListOutcome>> {
  const allowed = await deps.permissionChecker.hasPermission(
    input.currentUserId,
    { session: ['list'] }
  );
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
