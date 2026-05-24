import { createServerFn } from '@tanstack/react-start';

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

type ProtectedRunner = <T>(
  fn: (ctx: ProtectedContext) => Promise<T>
) => Promise<T>;

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
}: UserServerFunctionDeps) => ({
  userGetAll: createServerFn({ method: 'GET' })
    .inputValidator(zGetAllInput())
    .handler(async ({ data }) => {
      const { handlers, withProtectedContext } = await getDeps();
      return withProtectedContext((ctx) => handlers.getAll(ctx, data));
    }),

  userGetById: createServerFn({ method: 'GET' })
    .inputValidator(zGetByIdInput())
    .handler(async ({ data }) => {
      const { handlers, withProtectedContext } = await getDeps();
      return withProtectedContext((ctx) => handlers.getById(ctx, data));
    }),

  userUpdateById: createServerFn({ method: 'POST' })
    .inputValidator(zUpdateByIdInput())
    .handler(async ({ data }) => {
      const { handlers, withProtectedMutation } = await getDeps();
      return withProtectedMutation((ctx) => handlers.updateById(ctx, data));
    }),

  userCreate: createServerFn({ method: 'POST' })
    .inputValidator(zCreateInput())
    .handler(async ({ data }) => {
      const { handlers, withProtectedMutation } = await getDeps();
      return withProtectedMutation((ctx) => handlers.create(ctx, data));
    }),

  userDeleteById: createServerFn({ method: 'POST' })
    .inputValidator(zDeleteByIdInput())
    .handler(async ({ data }) => {
      const { handlers, withProtectedMutation } = await getDeps();
      return withProtectedMutation((ctx) => handlers.deleteById(ctx, data));
    }),

  userGetUserSessions: createServerFn({ method: 'GET' })
    .inputValidator(zGetUserSessionsInput())
    .handler(async ({ data }) => {
      const { handlers, withProtectedContext } = await getDeps();
      return withProtectedContext((ctx) => handlers.getUserSessions(ctx, data));
    }),

  userRevokeUserSessions: createServerFn({ method: 'POST' })
    .inputValidator(zRevokeUserSessionsInput())
    .handler(async ({ data }) => {
      const { handlers, withProtectedMutation } = await getDeps();
      return withProtectedMutation((ctx) =>
        handlers.revokeUserSessions(ctx, data)
      );
    }),

  userRevokeUserSession: createServerFn({ method: 'POST' })
    .inputValidator(zRevokeUserSessionInput())
    .handler(async ({ data }) => {
      const { handlers, withProtectedMutation } = await getDeps();
      return withProtectedMutation((ctx) =>
        handlers.revokeUserSession(ctx, data)
      );
    }),
});

export type UserServerFunctions = ReturnType<typeof createUserServerFunctions>;
