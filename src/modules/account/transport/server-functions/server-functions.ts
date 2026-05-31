import { createServerFn, createServerOnlyFn } from '@tanstack/react-start';

import {
  createServerFunctionInvoker,
  type ServerFnContextRunner,
} from '@/platform/lib/tanstack-start/server-function-handler';

import type { ProtectedContext } from '@/modules/auth/backend';

import {
  type AccountHandlers,
  createAccountHandlers,
  zSubmitOnboardingInput,
  zUpdateInfoInput,
} from '../http/account-handlers';

type ProtectedRunner = ServerFnContextRunner<ProtectedContext>;

type AccountServerRuntimeDeps = {
  handlers: AccountHandlers;
  withProtectedMutation: ProtectedRunner;
};

const getDeps = createServerOnlyFn(
  async (): Promise<AccountServerRuntimeDeps> => {
    const [{ getAccountUseCases }, { getKernel }, { withProtectedMutation }] =
      await Promise.all([
        import('@/composition/account'),
        import('@/composition/kernel'),
        import('@/modules/auth/backend'),
      ]);

    return {
      handlers: createAccountHandlers({
        getUseCases: (ctx) =>
          getAccountUseCases({
            kernel: getKernel({ logger: ctx.logger }),
          }),
      }),
      withProtectedMutation,
    };
  }
);

const runMutation = createServerFunctionInvoker({
  getDeps,
  selectRunner: (deps) => deps.withProtectedMutation,
});

export const accountSubmitOnboarding = createServerFn({ method: 'POST' })
  .inputValidator(zSubmitOnboardingInput())
  .handler(async ({ data }) =>
    runMutation(data, ({ handlers }, ctx, input) =>
      handlers.submitOnboarding(ctx, input)
    )
  );

export const accountUpdateInfo = createServerFn({ method: 'POST' })
  .inputValidator(zUpdateInfoInput())
  .handler(async ({ data }) =>
    runMutation(data, ({ handlers }, ctx, input) =>
      handlers.updateInfo(ctx, input)
    )
  );

export type AccountServerFunctions = {
  accountSubmitOnboarding: typeof accountSubmitOnboarding;
  accountUpdateInfo: typeof accountUpdateInfo;
};
