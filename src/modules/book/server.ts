import { createServerOnlyFn } from '@tanstack/react-start';

import { createBookHandlers } from './transport/http/book-handlers';
import { createBookServerFunctions } from './transport/tanstack/book-server-functions';

const getDeps = createServerOnlyFn(async () => {
  const [
    { getBookUseCases },
    { getKernel },
    { withProtectedContext, withProtectedMutation },
  ] = await Promise.all([
    import('@/composition/book'),
    import('@/composition/kernel'),
    import('@/modules/auth/server'),
  ]);

  return {
    handlers: createBookHandlers({
      getUseCases: (ctx) =>
        getBookUseCases({
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
    withProtectedMutation,
  };
});

const serverFunctions = createBookServerFunctions({ getDeps });

export const bookGetAll = serverFunctions.bookGetAll;
export const bookGetById = serverFunctions.bookGetById;
export const bookCreate = serverFunctions.bookCreate;
export const bookUpdateById = serverFunctions.bookUpdateById;
export const bookDeleteById = serverFunctions.bookDeleteById;
export type { BookServerFunctions } from './transport/tanstack/book-server-functions';
