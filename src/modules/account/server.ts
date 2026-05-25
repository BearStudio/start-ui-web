import { createServerOnlyFn } from '@tanstack/react-start';

import { createAccountHandlers } from './transport/http/account-handlers';
import { createAccountServerFunctions } from './transport/tanstack/account-server-functions';

const getDeps = createServerOnlyFn(async () => {
  const [
    { getAccountUseCases },
    { getKernelForProcedureLogger },
    { withProtectedMutation },
  ] = await Promise.all([
    import('@/composition/account'),
    import('@/composition/kernel'),
    import('@/modules/auth/server'),
  ]);

  return {
    handlers: createAccountHandlers({
      getUseCases: (ctx) =>
        getAccountUseCases({
          kernel: getKernelForProcedureLogger(ctx.logger),
        }),
    }),
    withProtectedMutation,
  };
});

const serverFunctions = createAccountServerFunctions({ getDeps });

export const accountSubmitOnboarding = serverFunctions.accountSubmitOnboarding;
export const accountUpdateInfo = serverFunctions.accountUpdateInfo;
export type { AccountServerFunctions } from './transport/tanstack/account-server-functions';
