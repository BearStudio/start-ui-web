import type { UserId } from '@/modules/kernel/domain/ids';

import type { AccountUseCaseDeps, UseCaseResult } from './types';
import type { AccountUpdateResult } from '../../domain/account';
import { normalizeAccountName } from '../../domain/account';

export type SubmitOnboardingInput = {
  currentUserId: UserId;
  name: string;
};

export async function submitOnboarding(
  deps: AccountUseCaseDeps,
  input: SubmitOnboardingInput
): Promise<UseCaseResult<AccountUpdateResult, 'not_found'>> {
  deps.logger.info('account.submit_onboarding', {
    event: 'account.submit_onboarding',
    userId: input.currentUserId,
  });
  const value = await deps.accountRepository.submitOnboarding(
    input.currentUserId,
    {
      name: normalizeAccountName(input.name),
      onboardedAt: deps.clock.now(),
    }
  );
  if (!value) return { ok: false, reason: 'not_found' };
  return { ok: true, value };
}
