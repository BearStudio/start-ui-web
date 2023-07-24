import { createNextRoute } from '@ts-rest/next';

import { accountRouter } from '@/features/account/api.server';
import { authRouter } from '@/features/auth/api.server';
import { repositoriesRouter } from '@/features/repositories/api.server';
import { usersRouter } from '@/features/users/api.server';

import { contract } from './contract';

export const router = createNextRoute(contract, {
  auth: authRouter,
  account: accountRouter,
  users: usersRouter,
  repositories: repositoriesRouter,
});
