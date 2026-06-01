import {
  type AccountRepository,
  createAccountUseCases,
} from '@/modules/account';
import { createAccountRepository } from '@/modules/auth/infrastructure/drizzle/account-repository-drizzle';

import { getKernel, type Kernel } from './kernel';
import { createCachedFactory } from './shared/singleton';

export type AccountOverrides = {
  kernel?: Kernel;
  accountRepository?: AccountRepository;
};

const buildAccountUseCases = (overrides?: AccountOverrides) => {
  const kernel = overrides?.kernel ?? getKernel();
  return createAccountUseCases({
    accountRepository:
      overrides?.accountRepository ??
      createAccountRepository({ db: kernel.db }),
    clock: kernel.clock,
    logger: kernel.logger,
    permissionChecker: kernel.permissionChecker,
  });
};

const factory = createCachedFactory(buildAccountUseCases);

export const getAccountUseCases = (overrides?: AccountOverrides) =>
  factory.get(overrides);

/** Test-only. */
export const __resetAccountComposition = () => factory.reset();
