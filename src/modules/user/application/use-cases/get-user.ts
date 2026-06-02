import { Result } from '@swan-io/boxed';

import type { UserId } from '@/modules/kernel/domain/ids';

import type { UserGetOutcome, UserResult, UserUseCaseDeps } from './types';

export type GetUserInput = {
  currentUserId: UserId;
  id: UserId;
};

export async function getUser(
  deps: UserUseCaseDeps,
  input: GetUserInput
): Promise<UserResult<UserGetOutcome>> {
  const allowed = await deps.permissionChecker.hasPermission(
    input.currentUserId,
    { user: ['list'] }
  );
  if (allowed.isError()) return Result.Error(allowed.getError());
  if (allowed.get().type === 'permission_denied') {
    return Result.Ok({ type: 'user_forbidden' });
  }

  deps.logger.info({
    event: 'user.get',
    details: { userId: input.id },
  });
  const result = await deps.userRepository.getById(input.id);
  if (result.isError()) return Result.Error(result.getError());
  return Result.Ok(result.get());
}
