import { createServerFn } from '@tanstack/react-start';

import {
  handlers,
  zSubmitOnboardingInput,
  zUpdateInfoInput,
} from '@/server/functions/account.handlers.server';
import { withProtectedMutation } from '@/server/middlewares.server';

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
