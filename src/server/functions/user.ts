import { createServerFn } from '@tanstack/react-start';

import {
  handlers,
  zCreateInput,
  zDeleteByIdInput,
  zGetAllInput,
  zGetByIdInput,
  zGetUserSessionsInput,
  zRevokeUserSessionInput,
  zRevokeUserSessionsInput,
  zUpdateByIdInput,
} from '@/server/functions/user.handlers.server';
import {
  withProtectedContext,
  withProtectedMutation,
} from '@/server/middlewares.server';

export const userGetAll = createServerFn({ method: 'GET' })
  .inputValidator(zGetAllInput())
  .handler(async ({ data }) =>
    withProtectedContext((ctx) => handlers.getAll(ctx, data))
  );

export const userGetById = createServerFn({ method: 'GET' })
  .inputValidator(zGetByIdInput())
  .handler(async ({ data }) =>
    withProtectedContext((ctx) => handlers.getById(ctx, data))
  );

export const userUpdateById = createServerFn({ method: 'POST' })
  .inputValidator(zUpdateByIdInput())
  .handler(async ({ data }) =>
    withProtectedMutation((ctx) => handlers.updateById(ctx, data))
  );

export const userCreate = createServerFn({ method: 'POST' })
  .inputValidator(zCreateInput())
  .handler(async ({ data }) =>
    withProtectedMutation((ctx) => handlers.create(ctx, data))
  );

export const userDeleteById = createServerFn({ method: 'POST' })
  .inputValidator(zDeleteByIdInput())
  .handler(async ({ data }) =>
    withProtectedMutation((ctx) => handlers.deleteById(ctx, data))
  );

export const userGetUserSessions = createServerFn({ method: 'GET' })
  .inputValidator(zGetUserSessionsInput())
  .handler(async ({ data }) =>
    withProtectedContext((ctx) => handlers.getUserSessions(ctx, data))
  );

export const userRevokeUserSessions = createServerFn({ method: 'POST' })
  .inputValidator(zRevokeUserSessionsInput())
  .handler(async ({ data }) =>
    withProtectedMutation((ctx) => handlers.revokeUserSessions(ctx, data))
  );

export const userRevokeUserSession = createServerFn({ method: 'POST' })
  .inputValidator(zRevokeUserSessionInput())
  .handler(async ({ data }) =>
    withProtectedMutation((ctx) => handlers.revokeUserSession(ctx, data))
  );
