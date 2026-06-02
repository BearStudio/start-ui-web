import { createServerFn, createServerOnlyFn } from '@tanstack/react-start';

import {
  createServerFunctionInvoker,
  type ServerFnContextRunner,
} from '@/platform/lib/tanstack-start/server-function-handler';

import type { ProtectedContext } from '@/modules/auth/backend';

import {
  createGenreHandlers,
  type GenreHandlers,
  zGetAllInput,
} from '../http/genre-handlers';

type ProtectedRunner = ServerFnContextRunner<ProtectedContext>;

type GenreServerRuntimeDeps = {
  handlers: GenreHandlers;
  withProtectedContext: ProtectedRunner;
};

const getDeps = createServerOnlyFn(
  async (): Promise<GenreServerRuntimeDeps> => {
    const [{ getGenreUseCases }, { getKernel }, { withProtectedContext }] =
      await Promise.all([
        import('@/composition/genre'),
        import('@/composition/kernel'),
        import('@/modules/auth/backend'),
      ]);

    return {
      handlers: createGenreHandlers({
        getUseCases: (ctx) =>
          getGenreUseCases({
            kernel: getKernel({ logger: ctx.logger }),
          }),
      }),
      withProtectedContext,
    };
  }
);

const runProtected = createServerFunctionInvoker({
  getDeps,
  selectRunner: (deps) => deps.withProtectedContext,
});

export const genreGetAll = createServerFn({ method: 'GET' })
  .inputValidator(zGetAllInput())
  .handler(async ({ data }) =>
    runProtected.withOperation('genre.getAll')(
      data,
      ({ handlers }, ctx, input) => handlers.getAll(ctx, input)
    )
  );

export type GenreServerFunctions = {
  genreGetAll: typeof genreGetAll;
};
