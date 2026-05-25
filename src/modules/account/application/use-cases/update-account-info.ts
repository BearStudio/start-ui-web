import type { RequestScope } from '@/modules/auth';
import { toUserId } from '@/modules/kernel/domain/ids';

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
): Promise<UseCaseResult<AccountUpdateResult, 'invalid' | 'not_found'>> {
  if (!isAccountNamePresent(input.name))
    return { ok: false, reason: 'invalid' };

  const currentUserId = toUserId(input.scope.userId);
  deps.logger.info('account.update_info', {
    event: 'account.update_info',
    userId: currentUserId,
  });
  const value = await deps.accountRepository.updateInfo(currentUserId, {
    name: normalizeAccountName(input.name),
  });
  if (!value) return { ok: false, reason: 'not_found' };
  return { ok: true, value };
}
