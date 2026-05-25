import type { RequestScope } from '@/modules/auth';
import { toUserId } from '@/modules/kernel/domain/ids';

import type { AccountUseCaseDeps, UseCaseResult } from './types';
import type { AccountUpdateResult } from '../../domain/account';
import { normalizeAccountName } from '../../domain/account';
import { isAccountNamePresent } from '../../domain/account-policy';

export type SubmitOnboardingInput = {
  scope: RequestScope;
  name: string;
};

export async function submitOnboarding(
  deps: AccountUseCaseDeps,
  input: SubmitOnboardingInput
): Promise<UseCaseResult<AccountUpdateResult, 'invalid' | 'not_found'>> {
  if (!isAccountNamePresent(input.name))
    return { ok: false, reason: 'invalid' };

  const currentUserId = toUserId(input.scope.userId);
  deps.logger.info('account.submit_onboarding', {
    event: 'account.submit_onboarding',
    userId: currentUserId,
  });
  const value = await deps.accountRepository.submitOnboarding(currentUserId, {
    name: normalizeAccountName(input.name),
    onboardedAt: deps.clock.now(),
  });
  if (!value) return { ok: false, reason: 'not_found' };
  return { ok: true, value };
}
