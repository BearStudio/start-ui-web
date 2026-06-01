import { Result } from '@swan-io/boxed';

import {
  hasScopePermission,
  type RequestScope,
  scopeUserId,
} from '@/modules/auth';

import type {
  AccountResult,
  AccountUpdateOutcome,
  AccountUseCaseDeps,
} from './types';
import { normalizeAccountName } from '../../domain/account';
import { isAccountNamePresent } from '../../domain/account-policy';

export type SubmitOnboardingInput = {
  scope: RequestScope;
  name: string;
};

export async function submitOnboarding(
  deps: AccountUseCaseDeps,
  input: SubmitOnboardingInput
): Promise<AccountResult<AccountUpdateOutcome>> {
  const allowed = await hasScopePermission({
    permissionChecker: deps.permissionChecker,
    scope: input.scope,
    permissions: { account: ['update'] },
  });
  if (allowed.isError()) return Result.Error(allowed.getError());
  if (allowed.get().type === 'permission_denied') {
    return Result.Ok({ type: 'account_forbidden' });
  }

  if (!isAccountNamePresent(input.name)) {
    return Result.Ok({ type: 'account_invalid' });
  }

  const currentUserId = scopeUserId(input.scope);
  deps.logger.info({
    event: 'account.submit_onboarding',
    userId: currentUserId,
  });
  const result = await deps.accountRepository.submitOnboarding(currentUserId, {
    name: normalizeAccountName(input.name),
    onboardedAt: deps.clock.now(),
  });
  if (result.isError()) return Result.Error(result.getError());
  return Result.Ok(result.get());
}
