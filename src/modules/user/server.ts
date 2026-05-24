import { createServerOnlyFn } from '@tanstack/react-start';

import { createUserHandlers } from './transport/http/user-handlers';
import { createUserServerFunctions } from './transport/tanstack/user-server-functions';

const getDeps = createServerOnlyFn(async () => {
  const [
    { getUserUseCases },
    { getKernel },
    { withProtectedContext, withProtectedMutation },
  ] = await Promise.all([
    import('@/composition/user'),
    import('@/composition/kernel'),
    import('@/modules/auth/server'),
  ]);

  return {
    handlers: createUserHandlers({
      getUseCases: (ctx) =>
        getUserUseCases({
          kernel: getKernel({
            logger: {
              info: (event, fields) => ctx.logger.info(fields ?? {}, event),
              warn: (event, fields) => ctx.logger.warn(fields ?? {}, event),
              error: (event, fields) => ctx.logger.error(fields ?? {}, event),
            },
          }),
        }),
    }),
    withProtectedContext,
    withProtectedMutation,
  };
});

const serverFunctions = createUserServerFunctions({ getDeps });

export const userGetAll = serverFunctions.userGetAll;
export const userGetById = serverFunctions.userGetById;
export const userUpdateById = serverFunctions.userUpdateById;
export const userCreate = serverFunctions.userCreate;
export const userDeleteById = serverFunctions.userDeleteById;
export const userGetUserSessions = serverFunctions.userGetUserSessions;
export const userRevokeUserSessions = serverFunctions.userRevokeUserSessions;
export const userRevokeUserSession = serverFunctions.userRevokeUserSession;
export type { UserServerFunctions } from './transport/tanstack/user-server-functions';
