import type { Clock } from '@/modules/kernel/application/ports/clock';
import type { Logger } from '@/modules/kernel/application/ports/logger';
import type { PermissionChecker } from '@/modules/kernel/application/ports/permission-checker';
import type { UseCaseResult } from '@/modules/kernel/application/result';

import type { AccountRepository } from '../ports/account-repository';

export type AccountUseCaseDeps = {
  accountRepository: AccountRepository;
  clock: Clock;
  logger: Logger;
  permissionChecker: PermissionChecker;
};

export type { UseCaseResult };
