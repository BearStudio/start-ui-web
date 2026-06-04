import { type AccountQueryFacade, createAccountQueries } from './queries';
import { accountSubmitOnboarding, accountUpdateInfo } from '../server';

export const accountQueries = createAccountQueries({
  accountSubmitOnboarding,
  accountUpdateInfo,
} satisfies AccountQueryFacade);
