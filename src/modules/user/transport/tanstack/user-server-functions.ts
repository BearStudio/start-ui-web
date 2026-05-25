import { createServerFn } from '@tanstack/react-start';

import {
  createServerFunctionInvoker,
  type ServerFnContextRunner,
} from '@/platform/lib/tanstack-start/server-function-handler';

import type { ProtectedContext } from '@/modules/auth/server';

import {
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

type UserServerFunctionDeps = {
  getDeps: () => Promise<UserServerRuntimeDeps> | UserServerRuntimeDeps;
};

type UserServerRuntimeDeps = {
  handlers: UserHandlers;
  withProtectedContext: ProtectedRunner;
  withProtectedMutation: ProtectedRunner;
};

export const createUserServerFunctions = ({
  getDeps,
}: UserServerFunctionDeps) => {
  const runProtected = createServerFunctionInvoker({
    getDeps,
    selectRunner: (deps) => deps.withProtectedContext,
  });
  const runMutation = createServerFunctionInvoker({
    getDeps,
    selectRunner: (deps) => deps.withProtectedMutation,
  });

  return {
    userGetAll: createServerFn({ method: 'GET' })
      .inputValidator(zGetAllInput())
      .handler(async ({ data }) =>
        runProtected(data, ({ handlers }, ctx, input) =>
          handlers.getAll(ctx, input)
        )
      ),

    userGetById: createServerFn({ method: 'GET' })
      .inputValidator(zGetByIdInput())
      .handler(async ({ data }) =>
        runProtected(data, ({ handlers }, ctx, input) =>
          handlers.getById(ctx, input)
        )
      ),

    userUpdateById: createServerFn({ method: 'POST' })
      .inputValidator(zUpdateByIdInput())
      .handler(async ({ data }) =>
        runMutation(data, ({ handlers }, ctx, input) =>
          handlers.updateById(ctx, input)
        )
      ),

    userCreate: createServerFn({ method: 'POST' })
      .inputValidator(zCreateInput())
      .handler(async ({ data }) =>
        runMutation(data, ({ handlers }, ctx, input) =>
          handlers.create(ctx, input)
        )
      ),

    userDeleteById: createServerFn({ method: 'POST' })
      .inputValidator(zDeleteByIdInput())
      .handler(async ({ data }) =>
        runMutation(data, ({ handlers }, ctx, input) =>
          handlers.deleteById(ctx, input)
        )
      ),

    userGetUserSessions: createServerFn({ method: 'GET' })
      .inputValidator(zGetUserSessionsInput())
      .handler(async ({ data }) =>
        runProtected(data, ({ handlers }, ctx, input) =>
          handlers.getUserSessions(ctx, input)
        )
      ),

    userRevokeUserSessions: createServerFn({ method: 'POST' })
      .inputValidator(zRevokeUserSessionsInput())
      .handler(async ({ data }) =>
        runMutation(data, ({ handlers }, ctx, input) =>
          handlers.revokeUserSessions(ctx, input)
        )
      ),

    userRevokeUserSession: createServerFn({ method: 'POST' })
      .inputValidator(zRevokeUserSessionInput())
      .handler(async ({ data }) =>
        runMutation(data, ({ handlers }, ctx, input) =>
          handlers.revokeUserSession(ctx, input)
        )
      ),
  };
};

export type UserServerFunctions = ReturnType<typeof createUserServerFunctions>;
