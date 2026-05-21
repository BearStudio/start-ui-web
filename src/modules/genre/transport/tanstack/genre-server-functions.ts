import { createServerFn } from '@tanstack/react-start';

import { withProtectedContext } from '@/modules/auth/server';

import { handlers, zGetAllInput } from '../http/genre-handlers';

export const genreGetAll = createServerFn({ method: 'GET' })
  .inputValidator(zGetAllInput())
  .handler(async ({ data }) =>
    withProtectedContext((ctx) => handlers.getAll(ctx, data))
  );
