import { createServerFn, createServerOnlyFn } from '@tanstack/react-start';

import {
  createServerFunctionInvoker,
  type ServerFnContextRunner,
} from '@/platform/lib/tanstack-start/server-function-handler';

import type { ProtectedContext } from '@/modules/auth/backend';

import {
  type BookHandlers,
  createBookHandlers,
  zCreateInput,
  zDeleteByIdInput,
  zGetAllInput,
  zGetByIdInput,
  zUpdateByIdInput,
} from '../http/book-handlers';

type ProtectedRunner = ServerFnContextRunner<ProtectedContext>;

type BookServerRuntimeDeps = {
  handlers: BookHandlers;
  withProtectedContext: ProtectedRunner;
  withProtectedMutation: ProtectedRunner;
};

const getDeps = createServerOnlyFn(async (): Promise<BookServerRuntimeDeps> => {
  const [
    { getBookUseCases },
    { getKernel },
    { withProtectedContext, withProtectedMutation },
  ] = await Promise.all([
    import('@/composition/book'),
    import('@/composition/kernel'),
    import('@/modules/auth/backend'),
  ]);

  return {
    handlers: createBookHandlers({
      getUseCases: (ctx) =>
        getBookUseCases({
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

export const bookGetAll = createServerFn({ method: 'GET' })
  .inputValidator(zGetAllInput())
  .handler(async ({ data }) =>
    runProtected.withOperation('book.getAll')(
      data,
      ({ handlers }, ctx, input) => handlers.getAll(ctx, input)
    )
  );

export const bookGetById = createServerFn({ method: 'GET' })
  .inputValidator(zGetByIdInput())
  .handler(async ({ data }) =>
    runProtected.withOperation('book.getById')(
      data,
      ({ handlers }, ctx, input) => handlers.getById(ctx, input)
    )
  );

export const bookCreate = createServerFn({ method: 'POST' })
  .inputValidator(zCreateInput())
  .handler(async ({ data }) =>
    runMutation.withOperation('book.create')(data, ({ handlers }, ctx, input) =>
      handlers.create(ctx, input)
    )
  );

export const bookUpdateById = createServerFn({ method: 'POST' })
  .inputValidator(zUpdateByIdInput())
  .handler(async ({ data }) =>
    runMutation.withOperation('book.updateById')(
      data,
      ({ handlers }, ctx, input) => handlers.updateById(ctx, input)
    )
  );

export const bookDeleteById = createServerFn({ method: 'POST' })
  .inputValidator(zDeleteByIdInput())
  .handler(async ({ data }) =>
    runMutation.withOperation('book.deleteById')(
      data,
      ({ handlers }, ctx, input) => handlers.deleteById(ctx, input)
    )
  );

export type BookServerFunctions = {
  bookGetAll: typeof bookGetAll;
  bookGetById: typeof bookGetById;
  bookCreate: typeof bookCreate;
  bookUpdateById: typeof bookUpdateById;
  bookDeleteById: typeof bookDeleteById;
};
