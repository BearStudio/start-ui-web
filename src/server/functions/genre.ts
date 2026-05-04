import { createServerFn } from '@tanstack/react-start';

import {
  handlers,
  zGetAllInput,
} from '@/server/functions/genre.handlers.server';
import { withProtectedContext } from '@/server/middlewares.server';

export const genreGetAll = createServerFn({ method: 'GET' })
  .inputValidator(zGetAllInput())
  .handler(async ({ data }) =>
    withProtectedContext((ctx) => handlers.getAll(ctx, data))
  );
