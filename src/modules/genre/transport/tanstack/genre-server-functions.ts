import { createServerFn } from '@tanstack/react-start';

import {
  createServerFunctionInvoker,
  type ServerFnContextRunner,
} from '@/platform/lib/tanstack-start/server-function-handler';

import type { ProtectedContext } from '@/modules/auth/server';

import { type GenreHandlers, zGetAllInput } from '../http/genre-handlers';

type ProtectedRunner = ServerFnContextRunner<ProtectedContext>;

type GenreServerFunctionDeps = {
  getDeps: () => Promise<GenreServerRuntimeDeps> | GenreServerRuntimeDeps;
};

type GenreServerRuntimeDeps = {
  handlers: GenreHandlers;
  withProtectedContext: ProtectedRunner;
};

export const createGenreServerFunctions = ({
  getDeps,
}: GenreServerFunctionDeps) => {
  const runProtected = createServerFunctionInvoker({
    getDeps,
    selectRunner: (deps) => deps.withProtectedContext,
  });

  return {
    genreGetAll: createServerFn({ method: 'GET' })
      .inputValidator(zGetAllInput())
      .handler(async ({ data }) =>
        runProtected(data, ({ handlers }, ctx, input) =>
          handlers.getAll(ctx, input)
        )
      ),
  };
};

export type GenreServerFunctions = ReturnType<
  typeof createGenreServerFunctions
>;
