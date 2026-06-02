import { Result } from '@swan-io/boxed';

import type { UserId } from '@/modules/kernel/domain/ids';

import type {
  AccountResult,
  AccountUpdateOutcome,
  AccountUseCaseDeps,
} from './types';
import { normalizeAccountName } from '../../domain/account';
import { isAccountNamePresent } from '../../domain/account-policy';

export type UpdateAccountInfoInput = {
  currentUserId: UserId;
  name: string;
};

export async function updateAccountInfo(
  deps: AccountUseCaseDeps,
  input: UpdateAccountInfoInput
): Promise<AccountResult<AccountUpdateOutcome>> {
  const allowed = await deps.permissionChecker.hasPermission(
    input.currentUserId,
    { account: ['update'] }
  );
  if (allowed.isError()) return Result.Error(allowed.getError());
  if (allowed.get().type === 'permission_denied') {
    return Result.Ok({ type: 'account_forbidden' });
  }

  if (!isAccountNamePresent(input.name)) {
    return Result.Ok({ type: 'account_invalid' });
  }

  deps.logger.info({
    event: 'account.update_info',
    userId: input.currentUserId,
  });
  const result = await deps.accountRepository.updateInfo(input.currentUserId, {
    name: normalizeAccountName(input.name),
  });
  if (result.isError()) return Result.Error(result.getError());
  return Result.Ok(result.get());
}
