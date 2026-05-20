import type { UserId } from '@/modules/kernel/domain/ids';

import type { UseCaseResult, UserUseCaseDeps } from './types';
import type { User } from '../../domain/user';

export type GetUserInput = {
  currentUserId: UserId;
  id: UserId;
};

export async function getUser(
  deps: UserUseCaseDeps,
  input: GetUserInput
): Promise<UseCaseResult<User, 'forbidden' | 'not_found'>> {
  const allowed = await deps.permissionChecker.hasPermission(
    input.currentUserId,
    {
      user: ['list'],
    }
  );
  if (!allowed) return { ok: false, reason: 'forbidden' };

  deps.logger.info('user.get', { event: 'user.get', userId: input.id });
  const value = await deps.userRepository.getById(input.id);
  if (!value) return { ok: false, reason: 'not_found' };
  return { ok: true, value };
}
