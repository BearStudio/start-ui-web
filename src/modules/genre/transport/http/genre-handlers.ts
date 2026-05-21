import { z } from 'zod';

import { getGenreUseCases } from '@/composition/genre';
import type { ProtectedContext } from '@/modules/auth/server';
import { toGenreId, toUserId, zGenreId } from '@/modules/kernel/domain/ids';
import { throwServerFnErrorForReason } from '@/modules/kernel/transport/tanstack/result-mapper';

export const zGetAllInput = () =>
  z
    .object({
      cursor: zGenreId().optional(),
      limit: z.coerce.number().int().min(1).max(100).prefault(20),
      searchTerm: z.string().trim().optional(),
    })
    .prefault({});

const getUseCases = (ctx: ProtectedContext) =>
  getGenreUseCases({
    overrides: {
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
  return throwServerFnErrorForReason(result.reason, {
    forbidden: 'FORBIDDEN',
  });
};

export type GenreHandlers = {
  getAll: typeof getAll;
};

export const handlers: GenreHandlers = {
  getAll,
};
