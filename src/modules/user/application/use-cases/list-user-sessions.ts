import type { SessionId, UserId } from '@/modules/kernel/domain/ids';

import type { UseCaseResult, UserUseCaseDeps } from './types';
import type { UserSessionListPage } from '../../domain/user';

export type ListUserSessionsInput = {
  currentUserId: UserId;
  userId: UserId;
  cursor?: SessionId;
  limit: number;
};

export async function listUserSessions(
  deps: UserUseCaseDeps,
  input: ListUserSessionsInput
): Promise<UseCaseResult<UserSessionListPage, 'forbidden'>> {
  const allowed = await deps.permissionChecker.hasPermission(
    input.currentUserId,
    {
      session: ['list'],
    }
  );
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
