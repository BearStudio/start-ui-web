import type { Clock } from '@/modules/kernel/application/ports/clock';
import type { Logger } from '@/modules/kernel/application/ports/logger';

import type { AccountRepository } from '../ports/account-repository';

export type AccountUseCaseDeps = {
  accountRepository: AccountRepository;
  clock: Clock;
  logger: Logger;
};

export type UseCaseResult<T, TReason extends string> =
  | { ok: true; value: T }
  | { ok: false; reason: TReason };
