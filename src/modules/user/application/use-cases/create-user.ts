import { Result } from '@swan-io/boxed';

import type { UserId } from '@/modules/kernel/domain/ids';

import type { UserCreateOutcome, UserResult, UserUseCaseDeps } from './types';
import type { UserCreateInput } from '../../domain/user';

export type CreateUserInput = {
  currentUserId: UserId;
  user: UserCreateInput;
};

export async function createUser(
  deps: UserUseCaseDeps,
  input: CreateUserInput
): Promise<UserResult<UserCreateOutcome>> {
  const allowed = await deps.permissionChecker.hasPermission(
    input.currentUserId,
    { user: ['create'] }
  );
  if (allowed.isError()) return Result.Error(allowed.getError());
  if (allowed.get().type === 'permission_denied') {
    return Result.Ok({ type: 'user_forbidden' });
  }

  deps.logger.info({ event: 'user.create' });
  const result = await deps.userRepository.create(input.user);
  if (result.isError()) return Result.Error(result.getError());
  return Result.Ok(result.get());
}
