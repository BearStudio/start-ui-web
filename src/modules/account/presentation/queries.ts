import { serverMutationOptions } from '@/platform/lib/tanstack-query/scoped-query-options';

import { accountSubmitOnboarding, accountUpdateInfo } from '../server';

export const accountQueries = {
  submitOnboarding: () =>
    serverMutationOptions({
      mutationKey: ['account', 'submitOnboarding'],
      mutationFn: accountSubmitOnboarding,
    }),
  updateInfo: () =>
    serverMutationOptions({
      mutationKey: ['account', 'updateInfo'],
      mutationFn: accountUpdateInfo,
    }),
};
