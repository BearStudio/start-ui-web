import type { Clock } from '@/modules/kernel/application/ports/clock';
import type { Logger } from '@/modules/kernel/application/ports/logger';
import type { UseCaseResult } from '@/modules/kernel/application/result';

import type { AccountRepository } from '../ports/account-repository';

export type AccountUseCaseDeps = {
  accountRepository: AccountRepository;
  clock: Clock;
  logger: Logger;
};

export type { UseCaseResult };
