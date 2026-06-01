import { z } from 'zod';

import type { ProtectedContext } from '@/modules/auth/backend';
import type { GenreUseCases } from '@/modules/genre';
import { toGenreId, zGenreId } from '@/modules/kernel/domain/ids';
import {
  type OutcomeHandlerConfig,
  unwrapApplicationResult,
} from '@/modules/kernel/transport/tanstack/result-mapper';

import type { GenreListOutcome } from '../../application/use-cases/types';
import type { GenreListPage } from '../../domain/genre';

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
  genre_forbidden: 'FORBIDDEN',
  genre_listed: (outcome) => outcome.page,
} as const satisfies OutcomeHandlerConfig<GenreListOutcome, GenreListPage>;

export const createGenreHandlers = ({ getUseCases }: GenreHandlerDeps) => {
  const getAll = async (
    ctx: ProtectedContext,
    data: z.output<ReturnType<typeof zGetAllInput>>
  ) => {
    return unwrapApplicationResult(
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
