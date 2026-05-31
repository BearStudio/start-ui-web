import { z } from 'zod';

import type { ProtectedContext } from '@/modules/auth/backend';
import type { GenreUseCases } from '@/modules/genre';
import { toGenreId, zGenreId } from '@/modules/kernel/domain/ids';
import { unwrapUseCaseResult } from '@/modules/kernel/transport/tanstack/result-mapper';

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

const genreReasonConfig = {
  forbidden: 'FORBIDDEN',
} as const;

export const createGenreHandlers = ({ getUseCases }: GenreHandlerDeps) => {
  const getAll = async (
    ctx: ProtectedContext,
    data: z.output<ReturnType<typeof zGetAllInput>>
  ) => {
    return unwrapUseCaseResult(
      getUseCases(ctx).list({
        scope: ctx.scope,
        cursor: data.cursor ? toGenreId(data.cursor) : undefined,
        limit: data.limit,
        searchTerm: data.searchTerm ?? '',
      }),
      genreReasonConfig
    );
  };

  return { getAll };
};

export type GenreHandlers = ReturnType<typeof createGenreHandlers>;
