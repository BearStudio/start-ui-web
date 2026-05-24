import { createServerOnlyFn } from '@tanstack/react-start';

import { createAccountHandlers } from './transport/http/account-handlers';
import { createAccountServerFunctions } from './transport/tanstack/account-server-functions';

const getDeps = createServerOnlyFn(async () => {
  const [{ getAccountUseCases }, { getKernel }, { withProtectedMutation }] =
    await Promise.all([
      import('@/composition/account'),
      import('@/composition/kernel'),
      import('@/modules/auth/server'),
    ]);

  return {
    handlers: createAccountHandlers({
      getUseCases: (ctx) =>
        getAccountUseCases({
          kernel: getKernel({
            logger: {
              info: (event, fields) => ctx.logger.info(fields ?? {}, event),
              warn: (event, fields) => ctx.logger.warn(fields ?? {}, event),
              error: (event, fields) => ctx.logger.error(fields ?? {}, event),
            },
          }),
        }),
    }),
    withProtectedMutation,
  };
});

const serverFunctions = createAccountServerFunctions({ getDeps });

export const accountSubmitOnboarding = serverFunctions.accountSubmitOnboarding;
export const accountUpdateInfo = serverFunctions.accountUpdateInfo;
export type { AccountServerFunctions } from './transport/tanstack/account-server-functions';
