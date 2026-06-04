import { serverMutationOptions } from '@/platform/lib/tanstack-query/scoped-query-options';
import type { ServerFunctionFacade } from '@/platform/lib/tanstack-start/server-function-types';

import type { AccountServerFunctions } from '../server';

export type AccountQueryFacade = ServerFunctionFacade<
  Pick<AccountServerFunctions, 'accountSubmitOnboarding' | 'accountUpdateInfo'>
>;

const accountQueryVersion = 'v1';

export const createAccountQueries = <TFacade extends AccountQueryFacade>(
  facade: TFacade
) => ({
  submitOnboarding: () =>
    serverMutationOptions({
      mutationKey: ['account', accountQueryVersion, 'submitOnboarding'],
      mutationFn: facade.accountSubmitOnboarding,
    }),
  updateInfo: () =>
    serverMutationOptions({
      mutationKey: ['account', accountQueryVersion, 'updateInfo'],
      mutationFn: facade.accountUpdateInfo,
    }),
});
