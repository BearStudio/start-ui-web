import { createServerFn } from '@tanstack/react-start';

import type { ProtectedContext } from '@/modules/auth/server';

import { type GenreHandlers, zGetAllInput } from '../http/genre-handlers';

type ProtectedRunner = <T>(
  fn: (ctx: ProtectedContext) => Promise<T>
) => Promise<T>;

type GenreServerFunctionDeps = {
  getDeps: () => Promise<GenreServerRuntimeDeps> | GenreServerRuntimeDeps;
};

type GenreServerRuntimeDeps = {
  handlers: GenreHandlers;
  withProtectedContext: ProtectedRunner;
};

export const createGenreServerFunctions = ({
  getDeps,
}: GenreServerFunctionDeps) => ({
  genreGetAll: createServerFn({ method: 'GET' })
    .inputValidator(zGetAllInput())
    .handler(async ({ data }) => {
      const { handlers, withProtectedContext } = await getDeps();
      return withProtectedContext((ctx) => handlers.getAll(ctx, data));
    }),
});

export type GenreServerFunctions = ReturnType<
  typeof createGenreServerFunctions
>;
