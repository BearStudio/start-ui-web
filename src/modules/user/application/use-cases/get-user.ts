import { hasScopePermission, type RequestScope } from '@/modules/auth';
import { fail, ok } from '@/modules/kernel';
import type { UserId } from '@/modules/kernel/domain/ids';

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
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { user: ['list'] },
  });
  if (!allowed) return fail('forbidden');

  deps.logger.info({
    event: 'user.get',
    details: { userId: input.id },
  });
  const value = await deps.userRepository.getById(input.id);
  if (!value) return fail('not_found');
  return ok(value);
}
