import { z } from 'zod';

import { getGenreUseCases } from '@/composition/genre';
import { toGenreId, toUserId } from '@/modules/kernel/domain/ids';
import type { ProtectedContext } from '@/server/middlewares.server';
import { ServerFnError } from '@/server/server-fn-error';

export const zGetAllInput = () =>
  z
    .object({
      cursor: z.string().optional(),
      limit: z.coerce.number().int().min(1).max(100).prefault(20),
      searchTerm: z.string().trim().optional(),
    })
    .prefault({});

const getUseCases = (ctx: ProtectedContext) =>
  getGenreUseCases({
    overrides: {
      db: ctx.db,
      logger: {
        info: (event, fields) => ctx.logger.info(fields ?? {}, event),
        warn: (event, fields) => ctx.logger.warn(fields ?? {}, event),
        error: (event, fields) => ctx.logger.error(fields ?? {}, event),
      },
    },
  });

const getAll = async (
  ctx: ProtectedContext,
  data: z.output<ReturnType<typeof zGetAllInput>>
) => {
  const result = await getUseCases(ctx).list({
    currentUserId: toUserId(ctx.user.id),
    cursor: data.cursor ? toGenreId(data.cursor) : undefined,
    limit: data.limit,
    searchTerm: data.searchTerm ?? '',
  });
  if (result.ok) return result.value;
  throw new ServerFnError('FORBIDDEN');
};

export type GenreHandlers = {
  getAll: typeof getAll;
};

export const handlers: GenreHandlers = {
  getAll,
};
