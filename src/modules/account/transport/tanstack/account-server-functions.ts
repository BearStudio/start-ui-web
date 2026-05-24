import { createServerFn } from '@tanstack/react-start';

import type { ProtectedContext } from '@/modules/auth/server';

import {
  type AccountHandlers,
  zSubmitOnboardingInput,
  zUpdateInfoInput,
} from '../http/account-handlers';

type ProtectedRunner = <T>(
  fn: (ctx: ProtectedContext) => Promise<T>
) => Promise<T>;

type AccountServerFunctionDeps = {
  getDeps: () => Promise<AccountServerRuntimeDeps> | AccountServerRuntimeDeps;
};

type AccountServerRuntimeDeps = {
  handlers: AccountHandlers;
  withProtectedMutation: ProtectedRunner;
};

export const createAccountServerFunctions = ({
  getDeps,
}: AccountServerFunctionDeps) => ({
  accountSubmitOnboarding: createServerFn({ method: 'POST' })
    .inputValidator(zSubmitOnboardingInput())
    .handler(async ({ data }) => {
      const { handlers, withProtectedMutation } = await getDeps();
      return withProtectedMutation((ctx) =>
        handlers.submitOnboarding(ctx, data)
      );
    }),

  accountUpdateInfo: createServerFn({ method: 'POST' })
    .inputValidator(zUpdateInfoInput())
    .handler(async ({ data }) => {
      const { handlers, withProtectedMutation } = await getDeps();
      return withProtectedMutation((ctx) => handlers.updateInfo(ctx, data));
    }),
});

export type AccountServerFunctions = ReturnType<
  typeof createAccountServerFunctions
>;
