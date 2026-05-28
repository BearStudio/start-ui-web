import {
  hasScopePermission,
  type RequestScope,
  scopeUserId,
} from '@/modules/auth';
import { fail, ok } from '@/modules/kernel';
import { AppError } from '@/modules/kernel/domain/errors/app-error';
import type { UserId } from '@/modules/kernel/domain/ids';

import type { UseCaseResult, UserUseCaseDeps } from './types';
import type { User, UserUpdateInput } from '../../domain/user';
import { shouldUnverifyEmail } from '../../domain/user';
import { canChangeRole } from '../../domain/user-policy';

export type UpdateUserInput = {
  scope: RequestScope;
  id: UserId;
  user: UserUpdateInput;
};

export async function updateUser(
  deps: UserUseCaseDeps,
  input: UpdateUserInput
): Promise<UseCaseResult<User, 'forbidden' | 'not_found' | 'duplicate'>> {
  const currentUserId = scopeUserId(input.scope);
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { user: ['update'] },
  });
  if (!allowed) return fail('forbidden');

  const current = await deps.userRepository.getUpdateSnapshot(input.id);
  if (!current) return fail('not_found');

  const nextRole =
    currentUserId === input.id ? undefined : (input.user.role ?? undefined);

  if (
    canChangeRole({
      currentUserId,
      userId: input.id,
      nextRole,
      currentRole: current.role,
    })
  ) {
    const canSetRole = await hasScopePermission({
      permissionChecker: deps.permissionChecker,
      scope: input.scope,
      permissions: { user: ['set-role'] },
    });
    if (!canSetRole) return fail('forbidden');
  }

  try {
    deps.logger.info({
      event: 'user.update',
      details: { userId: input.id },
    });
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
    if (!value) return fail('not_found');
    return ok(value);
  } catch (error) {
    if (error instanceof AppError && error.code === 'USER_DUPLICATE') {
      return fail('duplicate');
    }
    throw error;
  }
}
