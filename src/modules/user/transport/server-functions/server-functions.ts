import { createServerFn, createServerOnlyFn } from '@tanstack/react-start';

import {
  createServerFunctionInvoker,
  type ServerFnContextRunner,
} from '@/platform/lib/tanstack-start/server-function-handler';

import type { ProtectedContext } from '@/modules/auth/backend';

import {
  createUserHandlers,
  type UserHandlers,
  zCreateInput,
  zDeleteByIdInput,
  zGetAllInput,
  zGetByIdInput,
  zGetUserSessionsInput,
  zRevokeUserSessionInput,
  zRevokeUserSessionsInput,
  zUpdateByIdInput,
} from '../http/user-handlers';

type ProtectedRunner = ServerFnContextRunner<ProtectedContext>;

type UserServerRuntimeDeps = {
  handlers: UserHandlers;
  withProtectedContext: ProtectedRunner;
  withProtectedMutation: ProtectedRunner;
};

const getDeps = createServerOnlyFn(async (): Promise<UserServerRuntimeDeps> => {
  const [
    { getUserUseCases },
    { getKernel },
    { withProtectedContext, withProtectedMutation },
  ] = await Promise.all([
    import('@/composition/user'),
    import('@/composition/kernel'),
    import('@/modules/auth/backend'),
  ]);

  return {
    handlers: createUserHandlers({
      getUseCases: (ctx) =>
        getUserUseCases({
          kernel: getKernel({ logger: ctx.logger }),
        }),
    }),
    withProtectedContext,
    withProtectedMutation,
  };
});

const runProtected = createServerFunctionInvoker({
  getDeps,
  selectRunner: (deps) => deps.withProtectedContext,
});

const runMutation = createServerFunctionInvoker({
  getDeps,
  selectRunner: (deps) => deps.withProtectedMutation,
});

export const userGetAll = createServerFn({ method: 'GET' })
  .inputValidator(zGetAllInput())
  .handler(async ({ data }) =>
    runProtected(data, ({ handlers }, ctx, input) =>
      handlers.getAll(ctx, input)
    )
  );

export const userGetById = createServerFn({ method: 'GET' })
  .inputValidator(zGetByIdInput())
  .handler(async ({ data }) =>
    runProtected(data, ({ handlers }, ctx, input) =>
      handlers.getById(ctx, input)
    )
  );

export const userUpdateById = createServerFn({ method: 'POST' })
  .inputValidator(zUpdateByIdInput())
  .handler(async ({ data }) =>
    runMutation(data, ({ handlers }, ctx, input) =>
      handlers.updateById(ctx, input)
    )
  );

export const userCreate = createServerFn({ method: 'POST' })
  .inputValidator(zCreateInput())
  .handler(async ({ data }) =>
    runMutation(data, ({ handlers }, ctx, input) => handlers.create(ctx, input))
  );

export const userDeleteById = createServerFn({ method: 'POST' })
  .inputValidator(zDeleteByIdInput())
  .handler(async ({ data }) =>
    runMutation(data, ({ handlers }, ctx, input) =>
      handlers.deleteById(ctx, input)
    )
  );

export const userGetUserSessions = createServerFn({ method: 'GET' })
  .inputValidator(zGetUserSessionsInput())
  .handler(async ({ data }) =>
    runProtected(data, ({ handlers }, ctx, input) =>
      handlers.getUserSessions(ctx, input)
    )
  );

export const userRevokeUserSessions = createServerFn({ method: 'POST' })
  .inputValidator(zRevokeUserSessionsInput())
  .handler(async ({ data }) =>
    runMutation(data, ({ handlers }, ctx, input) =>
      handlers.revokeUserSessions(ctx, input)
    )
  );

export const userRevokeUserSession = createServerFn({ method: 'POST' })
  .inputValidator(zRevokeUserSessionInput())
  .handler(async ({ data }) =>
    runMutation(data, ({ handlers }, ctx, input) =>
      handlers.revokeUserSession(ctx, input)
    )
  );

export type UserServerFunctions = {
  userGetAll: typeof userGetAll;
  userGetById: typeof userGetById;
  userUpdateById: typeof userUpdateById;
  userCreate: typeof userCreate;
  userDeleteById: typeof userDeleteById;
  userGetUserSessions: typeof userGetUserSessions;
  userRevokeUserSessions: typeof userRevokeUserSessions;
  userRevokeUserSession: typeof userRevokeUserSession;
};
