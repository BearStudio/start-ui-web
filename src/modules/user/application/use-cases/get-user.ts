import type { RequestScope } from '@/modules/auth';
import type { UserId } from '@/modules/kernel/domain/ids';
import { toUserId } from '@/modules/kernel/domain/ids';

import type { UseCaseResult, UserUseCaseDeps } from './types';
import type { User } from '../../domain/user';

export type GetUserInput = {
  scope: RequestScope;
  id: UserId;
};

export async function getUser(
  deps: UserUseCaseDeps,
  input: GetUserInput
): Promise<UseCaseResult<User, 'forbidden' | 'not_found'>> {
  const currentUserId = toUserId(input.scope.userId);
  const allowed = await deps.permissionChecker.hasPermission(currentUserId, {
    user: ['list'],
  });
  if (!allowed) return { ok: false, reason: 'forbidden' };

  deps.logger.info('user.get', { event: 'user.get', userId: input.id });
  const value = await deps.userRepository.getById(input.id);
  if (!value) return { ok: false, reason: 'not_found' };
  return { ok: true, value };
}
