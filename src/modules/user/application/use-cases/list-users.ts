import type { RequestScope } from '@/modules/auth';
import type { UserId } from '@/modules/kernel/domain/ids';
import { toUserId } from '@/modules/kernel/domain/ids';

import type { UseCaseResult, UserUseCaseDeps } from './types';
import type { UserListPage } from '../../domain/user';

export type ListUsersInput = {
  scope: RequestScope;
  cursor?: UserId;
  limit: number;
  searchTerm: string;
};

export async function listUsers(
  deps: UserUseCaseDeps,
  input: ListUsersInput
): Promise<UseCaseResult<UserListPage, 'forbidden'>> {
  const currentUserId = toUserId(input.scope.userId);
  const allowed = await deps.permissionChecker.hasPermission(currentUserId, {
    user: ['list'],
  });
  if (!allowed) return { ok: false, reason: 'forbidden' };

  deps.logger.info('user.list', { event: 'user.list' });
  const value = await deps.userRepository.list({
    cursor: input.cursor,
    limit: input.limit,
    searchTerm: input.searchTerm,
  });
  return { ok: true, value };
}
