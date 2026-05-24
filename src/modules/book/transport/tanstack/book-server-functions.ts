import { createServerFn } from '@tanstack/react-start';

import type { ProtectedContext } from '@/modules/auth/server';
import { zFormFieldsBook } from '@/modules/book/presentation/schema';

import {
  type BookHandlers,
  zDeleteByIdInput,
  zGetAllInput,
  zGetByIdInput,
  zUpdateByIdInput,
} from '../http/book-handlers';

type ProtectedRunner = <T>(
  fn: (ctx: ProtectedContext) => Promise<T>
) => Promise<T>;

type BookServerFunctionDeps = {
  getDeps: () => Promise<BookServerRuntimeDeps> | BookServerRuntimeDeps;
};

type BookServerRuntimeDeps = {
  handlers: BookHandlers;
  withProtectedContext: ProtectedRunner;
  withProtectedMutation: ProtectedRunner;
};

export const createBookServerFunctions = ({
  getDeps,
}: BookServerFunctionDeps) => ({
  bookGetAll: createServerFn({ method: 'GET' })
    .inputValidator(zGetAllInput())
    .handler(async ({ data }) => {
      const { handlers, withProtectedContext } = await getDeps();
      return withProtectedContext((ctx) => handlers.getAll(ctx, data));
    }),

  bookGetById: createServerFn({ method: 'GET' })
    .inputValidator(zGetByIdInput())
    .handler(async ({ data }) => {
      const { handlers, withProtectedContext } = await getDeps();
      return withProtectedContext((ctx) => handlers.getById(ctx, data));
    }),

  bookCreate: createServerFn({ method: 'POST' })
    .inputValidator(zFormFieldsBook())
    .handler(async ({ data }) => {
      const { handlers, withProtectedMutation } = await getDeps();
      return withProtectedMutation((ctx) => handlers.create(ctx, data));
    }),

  bookUpdateById: createServerFn({ method: 'POST' })
    .inputValidator(zUpdateByIdInput())
    .handler(async ({ data }) => {
      const { handlers, withProtectedMutation } = await getDeps();
      return withProtectedMutation((ctx) => handlers.updateById(ctx, data));
    }),

  bookDeleteById: createServerFn({ method: 'POST' })
    .inputValidator(zDeleteByIdInput())
    .handler(async ({ data }) => {
      const { handlers, withProtectedMutation } = await getDeps();
      return withProtectedMutation((ctx) => handlers.deleteById(ctx, data));
    }),
});

export type BookServerFunctions = ReturnType<typeof createBookServerFunctions>;
