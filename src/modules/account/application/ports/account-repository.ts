import type { ApplicationResult } from '@/modules/kernel/application/result';
import type { UserId } from '@/modules/kernel/domain/ids';

import type {
  AccountOnboardingUpdate,
  AccountProfileUpdate,
  AccountUpdateResult,
} from '../../domain/account';

export type AccountUpdateRepositoryOutcome =
  | { type: 'account_updated'; account: AccountUpdateResult }
  | { type: 'account_not_found' };

export interface AccountRepository {
  submitOnboarding(
    userId: UserId,
    input: AccountOnboardingUpdate
  ): Promise<ApplicationResult<AccountUpdateRepositoryOutcome>>;
  updateInfo(
    userId: UserId,
    input: AccountProfileUpdate
  ): Promise<ApplicationResult<AccountUpdateRepositoryOutcome>>;
}
