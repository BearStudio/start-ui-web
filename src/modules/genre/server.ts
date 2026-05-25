import { createServerOnlyFn } from '@tanstack/react-start';

import { createGenreHandlers } from './transport/http/genre-handlers';
import { createGenreServerFunctions } from './transport/tanstack/genre-server-functions';

const getDeps = createServerOnlyFn(async () => {
  const [
    { getGenreUseCases },
    { getKernelForProcedureLogger },
    { withProtectedContext },
  ] = await Promise.all([
    import('@/composition/genre'),
    import('@/composition/kernel'),
    import('@/modules/auth/server'),
  ]);

  return {
    handlers: createGenreHandlers({
      getUseCases: (ctx) =>
        getGenreUseCases({
          kernel: getKernelForProcedureLogger(ctx.logger),
        }),
    }),
    withProtectedContext,
  };
});

const serverFunctions = createGenreServerFunctions({ getDeps });

export const genreGetAll = serverFunctions.genreGetAll;
export type { GenreServerFunctions } from './transport/tanstack/genre-server-functions';
