import { initContract } from '@ts-rest/core';

import { accountContract } from '@/features/account/api.contract';
import { authContract } from '@/features/auth/api.contract';
import { repositoriesContract } from '@/features/repositories/api.contract';
import { usersContract } from '@/features/users/api.contract';

const c = initContract();

export const contract = c.router({
  auth: authContract,
  account: accountContract,
  users: usersContract,
  repositories: repositoriesContract,
});

export type Contract = typeof contract;
