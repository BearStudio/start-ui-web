import { Result } from '@swan-io/boxed';

import { hasScopePermission, type RequestScope } from '@/modules/auth';

import type { UserCreateOutcome, UserResult, UserUseCaseDeps } from './types';
import type { UserCreateInput } from '../../domain/user';

export type CreateUserInput = {
  scope: RequestScope;
  user: UserCreateInput;
};

export async function createUser(
  deps: UserUseCaseDeps,
  input: CreateUserInput
): Promise<UserResult<UserCreateOutcome>> {
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { user: ['create'] },
  });
  if (allowed.isError()) return Result.Error(allowed.getError());
  if (allowed.get().type === 'permission_denied') {
    return Result.Ok({ type: 'user_forbidden' });
  }

  deps.logger.info({ event: 'user.create' });
  const result = await deps.userRepository.create(input.user);
  if (result.isError()) return Result.Error(result.getError());
  return Result.Ok(result.get());
}
