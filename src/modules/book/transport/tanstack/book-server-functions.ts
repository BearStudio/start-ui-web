import { createServerFn } from '@tanstack/react-start';

import {
  createServerFunctionInvoker,
  type ServerFnContextRunner,
} from '@/platform/lib/tanstack-start/server-function-handler';

import type { ProtectedContext } from '@/modules/auth/server';
import { zFormFieldsBook } from '@/modules/book/presentation/schema';

import {
  type BookHandlers,
  zDeleteByIdInput,
  zGetAllInput,
  zGetByIdInput,
  zUpdateByIdInput,
} from '../http/book-handlers';

type ProtectedRunner = ServerFnContextRunner<ProtectedContext>;

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
}: BookServerFunctionDeps) => {
  const runProtected = createServerFunctionInvoker({
    getDeps,
    selectRunner: (deps) => deps.withProtectedContext,
  });
  const runMutation = createServerFunctionInvoker({
    getDeps,
    selectRunner: (deps) => deps.withProtectedMutation,
  });

  return {
    bookGetAll: createServerFn({ method: 'GET' })
      .inputValidator(zGetAllInput())
      .handler(async ({ data }) =>
        runProtected(data, ({ handlers }, ctx, input) =>
          handlers.getAll(ctx, input)
        )
      ),

    bookGetById: createServerFn({ method: 'GET' })
      .inputValidator(zGetByIdInput())
      .handler(async ({ data }) =>
        runProtected(data, ({ handlers }, ctx, input) =>
          handlers.getById(ctx, input)
        )
      ),

    bookCreate: createServerFn({ method: 'POST' })
      .inputValidator(zFormFieldsBook())
      .handler(async ({ data }) =>
        runMutation(data, ({ handlers }, ctx, input) =>
          handlers.create(ctx, input)
        )
      ),

    bookUpdateById: createServerFn({ method: 'POST' })
      .inputValidator(zUpdateByIdInput())
      .handler(async ({ data }) =>
        runMutation(data, ({ handlers }, ctx, input) =>
          handlers.updateById(ctx, input)
        )
      ),

    bookDeleteById: createServerFn({ method: 'POST' })
      .inputValidator(zDeleteByIdInput())
      .handler(async ({ data }) =>
        runMutation(data, ({ handlers }, ctx, input) =>
          handlers.deleteById(ctx, input)
        )
      ),
  };
};

export type BookServerFunctions = ReturnType<typeof createBookServerFunctions>;
