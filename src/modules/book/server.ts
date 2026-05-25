import { createServerOnlyFn } from '@tanstack/react-start';

import { createBookHandlers } from './transport/http/book-handlers';
import { createBookServerFunctions } from './transport/tanstack/book-server-functions';

const getDeps = createServerOnlyFn(async () => {
  const [
    { getBookUseCases },
    { getKernelForProcedureLogger },
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
          kernel: getKernelForProcedureLogger(ctx.logger),
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
