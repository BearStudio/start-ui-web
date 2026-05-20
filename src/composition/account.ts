import type { AccountRepository } from '@/modules/account/application/ports/account-repository';
import { createAccountUseCases } from '@/modules/account/factory';
import { AccountRepositoryDrizzle } from '@/modules/account/infrastructure/drizzle/account-repository-drizzle';

import { getKernel, type KernelOverrides } from './kernel';
import { createCachedFactory } from './shared/singleton';

export type AccountCompositionOverrides = KernelOverrides & {
  accountRepository?: AccountRepository;
};

const buildAccountUseCases = (overrides?: AccountCompositionOverrides) => {
  const kernel = getKernel({ overrides });
  return createAccountUseCases({
    accountRepository:
      overrides?.accountRepository ?? new AccountRepositoryDrizzle(kernel.db),
    clock: kernel.clock,
    logger: kernel.logger,
  });
};

const getCachedAccountUseCases = createCachedFactory(() =>
  buildAccountUseCases()
);

export function getAccountUseCases(options?: {
  overrides?: AccountCompositionOverrides;
}) {
  if (options?.overrides && Object.keys(options.overrides).length > 0) {
    return buildAccountUseCases(options.overrides);
  }
  return getCachedAccountUseCases(false);
}
