import { type MutationOptions } from '@tanstack/react-query';

import {
  accountSubmitOnboarding,
  accountUpdateInfo,
} from '../transport/tanstack/account-server-functions';

export const accountQueries = {
  submitOnboarding: (): MutationOptions<
    Awaited<ReturnType<typeof accountSubmitOnboarding>>,
    Error,
    Parameters<typeof accountSubmitOnboarding>[0]['data']
  > => ({
    mutationKey: ['account', 'submitOnboarding'],
    mutationFn: (data) => accountSubmitOnboarding({ data }),
  }),
  updateInfo: (): MutationOptions<
    Awaited<ReturnType<typeof accountUpdateInfo>>,
    Error,
    Parameters<typeof accountUpdateInfo>[0]['data']
  > => ({
    mutationKey: ['account', 'updateInfo'],
    mutationFn: (data) => accountUpdateInfo({ data }),
  }),
};
