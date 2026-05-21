import { AppError } from '@/modules/kernel/domain/errors/app-error';
import type { UserId } from '@/modules/kernel/domain/ids';

import type { UseCaseResult, UserUseCaseDeps } from './types';
import type { User, UserUpdateInput } from '../../domain/user';
import { shouldUnverifyEmail } from '../../domain/user';
import { canChangeRole } from '../../domain/user-policy';

export type UpdateUserInput = {
  currentUserId: UserId;
  id: UserId;
  user: UserUpdateInput;
};

export async function updateUser(
  deps: UserUseCaseDeps,
  input: UpdateUserInput
): Promise<UseCaseResult<User, 'forbidden' | 'not_found' | 'duplicate'>> {
  const allowed = await deps.permissionChecker.hasPermission(
    input.currentUserId,
    {
      user: ['update'],
    }
  );
  if (!allowed) return { ok: false, reason: 'forbidden' };

  const current = await deps.userRepository.getUpdateSnapshot(input.id);
  if (!current) return { ok: false, reason: 'not_found' };

  const nextRole =
    input.currentUserId === input.id
      ? undefined
      : (input.user.role ?? undefined);

  if (
    canChangeRole({
      currentUserId: input.currentUserId,
      targetUserId: input.id,
      nextRole,
      currentRole: current.role,
    })
  ) {
    const canSetRole = await deps.permissionChecker.hasPermission(
      input.currentUserId,
      { user: ['set-role'] }
    );
    if (!canSetRole) return { ok: false, reason: 'forbidden' };
  }

  try {
    deps.logger.info('user.update', { event: 'user.update', userId: input.id });
    const update = {
      email: input.user.email,
      role: nextRole,
      emailVerified: shouldUnverifyEmail(current.email, input.user.email)
        ? false
        : undefined,
      ...(input.user.name === undefined ? {} : { name: input.user.name ?? '' }),
    };
    const value = await deps.userRepository.update(input.id, {
      ...update,
    });
    if (!value) return { ok: false, reason: 'not_found' };
    return { ok: true, value };
  } catch (error) {
    if (error instanceof AppError && error.code === 'USER_DUPLICATE') {
      return { ok: false, reason: 'duplicate' };
    }
    throw error;
  }
}
