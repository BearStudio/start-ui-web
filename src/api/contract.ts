import { initContract } from '@ts-rest/core';

import { accountContract } from '@/features/account/contract';
import { authContract } from '@/features/auth/contract';
import { repositoriesContract } from '@/features/repositories/contract';
import { usersContract } from '@/features/users/contract';

const c = initContract();

export const contract = c.router({
  auth: authContract,
  account: accountContract,
  users: usersContract,
  repositories: repositoriesContract,
});

export type Contract = typeof contract;
