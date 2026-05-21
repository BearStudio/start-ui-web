import type { UserId } from '@/modules/kernel/domain/ids';

import type {
  AccountOnboardingUpdate,
  AccountProfileUpdate,
  AccountUpdateResult,
} from '../../domain/account';

export interface AccountRepository {
  submitOnboarding(
    userId: UserId,
    input: AccountOnboardingUpdate
  ): Promise<AccountUpdateResult | null>;
  updateInfo(
    userId: UserId,
    input: AccountProfileUpdate
  ): Promise<AccountUpdateResult | null>;
}
