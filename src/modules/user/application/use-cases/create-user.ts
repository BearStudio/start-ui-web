import { hasScopePermission, type RequestScope } from '@/modules/auth';
import { fail, ok } from '@/modules/kernel';
import { AppError } from '@/modules/kernel/domain/errors/app-error';

import type { UseCaseResult, UserUseCaseDeps } from './types';
import type { User, UserCreateInput } from '../../domain/user';

export type CreateUserInput = {
  scope: RequestScope;
  user: UserCreateInput;
};

export async function createUser(
  deps: UserUseCaseDeps,
  input: CreateUserInput
): Promise<UseCaseResult<User, 'forbidden' | 'duplicate'>> {
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { user: ['create'] },
  });
  if (!allowed) return fail('forbidden');

  try {
    deps.logger.info('user.create', { event: 'user.create' });
    const value = await deps.userRepository.create(input.user);
    return ok(value);
  } catch (error) {
    if (error instanceof AppError && error.code === 'USER_DUPLICATE') {
      return fail('duplicate');
    }
    throw error;
  }
}
