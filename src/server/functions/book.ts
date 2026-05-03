import { createServerFn } from '@tanstack/react-start';

import { zFormFieldsBook } from '@/features/book/schema';
import {
  handlers,
  zDeleteByIdInput,
  zGetAllInput,
  zGetByIdInput,
  zUpdateByIdInput,
} from '@/server/functions/book.handlers.server';
import {
  withProtectedContext,
  withProtectedMutation,
} from '@/server/middlewares.server';

export const bookGetAll = createServerFn({ method: 'GET' })
  .inputValidator(zGetAllInput())
  .handler(async ({ data }) =>
    withProtectedContext((ctx) => handlers.getAll(ctx, data))
  );

export const bookGetById = createServerFn({ method: 'GET' })
  .inputValidator(zGetByIdInput())
  .handler(async ({ data }) =>
    withProtectedContext((ctx) => handlers.getById(ctx, data))
  );

export const bookCreate = createServerFn({ method: 'POST' })
  .inputValidator(zFormFieldsBook())
  .handler(async ({ data }) =>
    withProtectedMutation((ctx) => handlers.create(ctx, data))
  );

export const bookUpdateById = createServerFn({ method: 'POST' })
  .inputValidator(zUpdateByIdInput())
  .handler(async ({ data }) =>
    withProtectedMutation((ctx) => handlers.updateById(ctx, data))
  );

export const bookDeleteById = createServerFn({ method: 'POST' })
  .inputValidator(zDeleteByIdInput())
  .handler(async ({ data }) =>
    withProtectedMutation((ctx) => handlers.deleteById(ctx, data))
  );
