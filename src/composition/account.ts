import type { AccountRepository } from '@/modules/account/application/ports/account-repository';
import { createAccountUseCases } from '@/modules/account/factory';
import { AccountRepositoryDrizzle } from '@/modules/account/infrastructure/drizzle/account-repository-drizzle';

import { getKernel, type KernelOverrides } from './kernel';
import { hasDefinedOverrides } from './shared/overrides';
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
  const overrides = options?.overrides;
  if (hasDefinedOverrides(overrides)) {
    return buildAccountUseCases(overrides);
  }
  return getCachedAccountUseCases(false);
}
