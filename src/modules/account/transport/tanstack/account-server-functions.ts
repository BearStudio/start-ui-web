import { createServerFn } from '@tanstack/react-start';

import {
  createServerFunctionInvoker,
  type ServerFnContextRunner,
} from '@/platform/lib/tanstack-start/server-function-handler';

import type { ProtectedContext } from '@/modules/auth/server';

import {
  type AccountHandlers,
  zSubmitOnboardingInput,
  zUpdateInfoInput,
} from '../http/account-handlers';

type ProtectedRunner = ServerFnContextRunner<ProtectedContext>;

type AccountServerFunctionDeps = {
  getDeps: () => Promise<AccountServerRuntimeDeps> | AccountServerRuntimeDeps;
};

type AccountServerRuntimeDeps = {
  handlers: AccountHandlers;
  withProtectedMutation: ProtectedRunner;
};

export const createAccountServerFunctions = ({
  getDeps,
}: AccountServerFunctionDeps) => {
  const runMutation = createServerFunctionInvoker({
    getDeps,
    selectRunner: (deps) => deps.withProtectedMutation,
  });

  return {
    accountSubmitOnboarding: createServerFn({ method: 'POST' })
      .inputValidator(zSubmitOnboardingInput())
      .handler(async ({ data }) =>
        runMutation(data, ({ handlers }, ctx, input) =>
          handlers.submitOnboarding(ctx, input)
        )
      ),

    accountUpdateInfo: createServerFn({ method: 'POST' })
      .inputValidator(zUpdateInfoInput())
      .handler(async ({ data }) =>
        runMutation(data, ({ handlers }, ctx, input) =>
          handlers.updateInfo(ctx, input)
        )
      ),
  };
};

export type AccountServerFunctions = ReturnType<
  typeof createAccountServerFunctions
>;
