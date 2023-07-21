import { initContract } from '@ts-rest/core';

import { accountContract } from '@/features/account/contract';
import { authContract } from '@/features/auth/contract';
import { usersContract } from '@/features/users/contract';

const c = initContract();

export const contract = c.router({
  auth: authContract,
  account: accountContract,
  users: usersContract,
});

export type Contract = typeof contract;
