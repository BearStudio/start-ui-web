import { createServerOnlyFn } from '@tanstack/react-start';

import { createGenreHandlers } from './transport/http/genre-handlers';
import { createGenreServerFunctions } from './transport/tanstack/genre-server-functions';

const getDeps = createServerOnlyFn(async () => {
  const [{ getGenreUseCases }, { getKernel }, { withProtectedContext }] =
    await Promise.all([
      import('@/composition/genre'),
      import('@/composition/kernel'),
      import('@/modules/auth/server'),
    ]);

  return {
    handlers: createGenreHandlers({
      getUseCases: (ctx) =>
        getGenreUseCases({
          kernel: getKernel({
            logger: {
              info: (event, fields) => ctx.logger.info(fields ?? {}, event),
              warn: (event, fields) => ctx.logger.warn(fields ?? {}, event),
              error: (event, fields) => ctx.logger.error(fields ?? {}, event),
            },
          }),
        }),
    }),
    withProtectedContext,
  };
});

const serverFunctions = createGenreServerFunctions({ getDeps });

export const genreGetAll = serverFunctions.genreGetAll;
export type { GenreServerFunctions } from './transport/tanstack/genre-server-functions';
