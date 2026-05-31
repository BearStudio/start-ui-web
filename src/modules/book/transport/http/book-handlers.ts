import { z } from 'zod';

import type { ProtectedContext } from '@/modules/auth/backend';
import type { BookUseCases } from '@/modules/book';
import { toBookId, toGenreId } from '@/modules/kernel/domain/ids';
import { unwrapUseCaseResult } from '@/modules/kernel/transport/tanstack/result-mapper';

export const zGetAllInput = () =>
  z
    .object({
      cursor: z.string().optional(),
      limit: z.coerce.number().int().min(1).max(100).prefault(20),
      searchTerm: z.string().trim().optional(),
    })
    .prefault({});

export const zGetByIdInput = () => z.object({ id: z.string() });

const zBookWriteInput = () =>
  z.object({
    title: z.string().trim().min(1),
    author: z.string().trim().min(1),
    genreId: z.string().trim().min(1),
    publisher: z.string().nullish(),
    coverId: z.string().nullish(),
  });

export const zCreateInput = () => zBookWriteInput();
export const zUpdateByIdInput = () =>
  zBookWriteInput().extend({ id: z.string() });
export const zDeleteByIdInput = () => z.object({ id: z.string() });

type BookHandlerDeps = {
  getUseCases: (ctx: ProtectedContext) => BookUseCases;
};

const bookReasonConfig = {
  duplicate: {
    code: 'CONFLICT',
    message: 'Unique constraint violation',
    data: { target: ['title', 'author'] },
  },
  forbidden: 'FORBIDDEN',
  not_found: 'NOT_FOUND',
} as const;

export const createBookHandlers = ({ getUseCases }: BookHandlerDeps) => {
  const getAll = async (
    ctx: ProtectedContext,
    data: z.output<ReturnType<typeof zGetAllInput>>
  ) => {
    return unwrapUseCaseResult(
      getUseCases(ctx).list({
        scope: ctx.scope,
        cursor: data.cursor ? toBookId(data.cursor) : undefined,
        limit: data.limit,
        searchTerm: data.searchTerm ?? '',
      }),
      bookReasonConfig
    );
  };

  const getById = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zGetByIdInput>>
  ) => {
    return unwrapUseCaseResult(
      getUseCases(ctx).get({
        scope: ctx.scope,
        id: toBookId(data.id),
      }),
      bookReasonConfig
    );
  };

  const create = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zCreateInput>>
  ) => {
    return unwrapUseCaseResult(
      getUseCases(ctx).create({
        scope: ctx.scope,
        book: {
          title: data.title,
          author: data.author,
          genreId: toGenreId(data.genreId),
          publisher: data.publisher,
          coverId: data.coverId,
        },
      }),
      bookReasonConfig
    );
  };

  const updateById = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zUpdateByIdInput>>
  ) => {
    return unwrapUseCaseResult(
      getUseCases(ctx).update({
        scope: ctx.scope,
        id: toBookId(data.id),
        book: {
          title: data.title,
          author: data.author,
          genreId: toGenreId(data.genreId),
          publisher: data.publisher,
          coverId: data.coverId,
        },
      }),
      bookReasonConfig
    );
  };

  const deleteById = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zDeleteByIdInput>>
  ) => {
    return unwrapUseCaseResult(
      getUseCases(ctx).delete({
        scope: ctx.scope,
        id: toBookId(data.id),
      }),
      bookReasonConfig
    );
  };

  return {
    getAll,
    getById,
    create,
    updateById,
    deleteById,
  };
};

export type BookHandlers = ReturnType<typeof createBookHandlers>;
