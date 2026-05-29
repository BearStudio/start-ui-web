import {
  hasScopePermission,
  type RequestScope,
  scopeUserId,
} from '@/modules/auth';
import { fail, ok } from '@/modules/kernel';

import type { AccountUseCaseDeps, UseCaseResult } from './types';
import type { AccountUpdateResult } from '../../domain/account';
import { normalizeAccountName } from '../../domain/account';
import { isAccountNamePresent } from '../../domain/account-policy';

export type UpdateAccountInfoInput = {
  scope: RequestScope;
  name: string;
};

export async function updateAccountInfo(
  deps: AccountUseCaseDeps,
  input: UpdateAccountInfoInput
): Promise<
  UseCaseResult<AccountUpdateResult, 'forbidden' | 'invalid' | 'not_found'>
> {
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { account: ['update'] },
  });
  if (!allowed) return fail('forbidden');

  if (!isAccountNamePresent(input.name)) return fail('invalid');

  const currentUserId = scopeUserId(input.scope);
  deps.logger.info({
    event: 'account.update_info',
    userId: currentUserId,
  });
  const value = await deps.accountRepository.updateInfo(currentUserId, {
    name: normalizeAccountName(input.name),
  });
  if (!value) return fail('not_found');
  return ok(value);
}
