import { z } from 'zod';

import type { ProtectedContext } from '@/modules/auth/server';
import type { GenreUseCases } from '@/modules/genre';
import { toGenreId, zGenreId } from '@/modules/kernel/domain/ids';
import { throwServerFnErrorForReason } from '@/modules/kernel/transport/tanstack/result-mapper';

export const zGetAllInput = () =>
  z
    .object({
      cursor: zGenreId().optional(),
      limit: z.coerce.number().int().min(1).max(100).prefault(20),
      searchTerm: z.string().trim().optional(),
    })
    .prefault({});

type GenreHandlerDeps = {
  getUseCases: (ctx: ProtectedContext) => GenreUseCases;
};

export const createGenreHandlers = ({ getUseCases }: GenreHandlerDeps) => {
  const getAll = async (
    ctx: ProtectedContext,
    data: z.output<ReturnType<typeof zGetAllInput>>
  ) => {
    const result = await getUseCases(ctx).list({
      scope: ctx.scope,
      cursor: data.cursor ? toGenreId(data.cursor) : undefined,
      limit: data.limit,
      searchTerm: data.searchTerm ?? '',
    });
    if (result.ok) return result.value;
    return throwServerFnErrorForReason(result.reason, {
      forbidden: 'FORBIDDEN',
    });
  };

  return { getAll };
};

export type GenreHandlers = ReturnType<typeof createGenreHandlers>;
