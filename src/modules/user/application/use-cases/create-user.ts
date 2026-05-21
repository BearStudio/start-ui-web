import { AppError } from '@/modules/kernel/domain/errors/app-error';
import type { UserId } from '@/modules/kernel/domain/ids';

import type { UseCaseResult, UserUseCaseDeps } from './types';
import type { User, UserCreateInput } from '../../domain/user';

export type CreateUserInput = {
  currentUserId: UserId;
  user: UserCreateInput;
};

export async function createUser(
  deps: UserUseCaseDeps,
  input: CreateUserInput
): Promise<UseCaseResult<User, 'forbidden' | 'duplicate'>> {
  const allowed = await deps.permissionChecker.hasPermission(
    input.currentUserId,
    {
      user: ['create'],
    }
  );
  if (!allowed) return { ok: false, reason: 'forbidden' };

  try {
    deps.logger.info('user.create', { event: 'user.create' });
    const value = await deps.userRepository.create(input.user);
    return { ok: true, value };
  } catch (error) {
    if (error instanceof AppError && error.category === 'conflict') {
      return { ok: false, reason: 'duplicate' };
    }
    throw error;
  }
}
