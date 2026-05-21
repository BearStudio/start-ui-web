import { createServerFn } from '@tanstack/react-start';

import { withProtectedMutation } from '@/modules/auth/server';

import {
  handlers,
  zSubmitOnboardingInput,
  zUpdateInfoInput,
} from '../http/account-handlers';

export const accountSubmitOnboarding = createServerFn({ method: 'POST' })
  .inputValidator(zSubmitOnboardingInput())
  .handler(async ({ data }) =>
    withProtectedMutation((ctx) => handlers.submitOnboarding(ctx, data))
  );

export const accountUpdateInfo = createServerFn({ method: 'POST' })
  .inputValidator(zUpdateInfoInput())
  .handler(async ({ data }) =>
    withProtectedMutation((ctx) => handlers.updateInfo(ctx, data))
  );
