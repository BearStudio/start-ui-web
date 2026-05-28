import { hasScopePermission, type RequestScope } from '@/modules/auth';
import { fail, ok } from '@/modules/kernel';
import type { SessionId, UserId } from '@/modules/kernel/domain/ids';

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
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { session: ['list'] },
  });
  if (!allowed) return fail('forbidden');

  deps.logger.info({
    event: 'user.sessions.list',
    details: {
      userId: input.userId,
    },
  });
  const value = await deps.userRepository.listSessions({
    userId: input.userId,
    cursor: input.cursor,
    limit: input.limit,
  });
  return ok(value);
}
