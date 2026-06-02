import { serverMutationOptions } from '@/platform/lib/tanstack-query/scoped-query-options';

import { accountSubmitOnboarding, accountUpdateInfo } from '../server';

const accountQueryVersion = 'v1';

export const accountQueries = {
  submitOnboarding: () =>
    serverMutationOptions({
      mutationKey: ['account', accountQueryVersion, 'submitOnboarding'],
      mutationFn: accountSubmitOnboarding,
    }),
  updateInfo: () =>
    serverMutationOptions({
      mutationKey: ['account', accountQueryVersion, 'updateInfo'],
      mutationFn: accountUpdateInfo,
    }),
};
