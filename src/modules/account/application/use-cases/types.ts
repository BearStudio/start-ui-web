import type { Clock } from '@/modules/kernel/application/ports/clock';
import type { Logger } from '@/modules/kernel/application/ports/logger';
import type { PermissionChecker } from '@/modules/kernel/application/ports/permission-checker';
import type { ApplicationResult } from '@/modules/kernel/application/result';

import type {
  AccountRepository,
  AccountUpdateRepositoryOutcome,
} from '../ports/account-repository';

export type AccountUseCaseDeps = {
  accountRepository: AccountRepository;
  clock: Clock;
  logger: Logger;
  permissionChecker: PermissionChecker;
};

export type AccountUpdateOutcome =
  | AccountUpdateRepositoryOutcome
  | { type: 'account_forbidden' }
  | { type: 'account_invalid' };

export type AccountResult<TOutcome> = ApplicationResult<TOutcome>;
