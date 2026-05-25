import type { RequestScope } from '@/modules/auth';
import type { SessionId, UserId } from '@/modules/kernel/domain/ids';
import { toUserId } from '@/modules/kernel/domain/ids';

import type { UseCaseResult, UserUseCaseDeps } from './types';
import type { UserSessionListPage } from '../../domain/user';

export type ListUserSessionsInput = {
  scope: RequestScope;
  userId: UserId;
  cursor?: SessionId;
  limit: number;
};

export async function listUserSessions(
  deps: UserUseCaseDeps,
  input: ListUserSessionsInput
): Promise<UseCaseResult<UserSessionListPage, 'forbidden'>> {
  const currentUserId = toUserId(input.scope.userId);
  const allowed = await deps.permissionChecker.hasPermission(currentUserId, {
    session: ['list'],
  });
  if (!allowed) return { ok: false, reason: 'forbidden' };

  deps.logger.info('user.sessions.list', {
    event: 'user.sessions.list',
    userId: input.userId,
  });
  const value = await deps.userRepository.listSessions({
    userId: input.userId,
    cursor: input.cursor,
    limit: input.limit,
  });
  return { ok: true, value };
}
