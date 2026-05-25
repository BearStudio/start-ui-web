import { z } from 'zod';

import type { ProtectedContext } from '@/modules/auth/server';
import type { BookUseCases } from '@/modules/book';
import { toBookId, toGenreId } from '@/modules/kernel/domain/ids';
import {
  mapAppErrorToServerFnError,
  throwServerFnErrorForReason,
} from '@/modules/kernel/transport/tanstack/result-mapper';

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

export const zUpdateByIdInput = () =>
  zBookWriteInput().extend({ id: z.string() });
export const zDeleteByIdInput = () => z.object({ id: z.string() });

type BookHandlerDeps = {
  getUseCases: (ctx: ProtectedContext) => BookUseCases;
};

const mapReason = (reason: string): never => {
  return throwServerFnErrorForReason(reason, {
    duplicate: {
      code: 'CONFLICT',
      message: 'Unique constraint violation',
      data: { target: ['title', 'author'] },
    },
    forbidden: 'FORBIDDEN',
    not_found: 'NOT_FOUND',
  });
};

export const createBookHandlers = ({ getUseCases }: BookHandlerDeps) => {
  const getAll = async (
    ctx: ProtectedContext,
    data: z.output<ReturnType<typeof zGetAllInput>>
  ) => {
    const result = await getUseCases(ctx)
      .list({
        scope: ctx.scope,
        cursor: data.cursor ? toBookId(data.cursor) : undefined,
        limit: data.limit,
        searchTerm: data.searchTerm ?? '',
      })
      .catch(mapAppErrorToServerFnError);
    if (result.ok) return result.value;
    return mapReason(result.reason);
  };

  const getById = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zGetByIdInput>>
  ) => {
    const result = await getUseCases(ctx)
      .get({
        scope: ctx.scope,
        id: toBookId(data.id),
      })
      .catch(mapAppErrorToServerFnError);
    if (result.ok) return result.value;
    return mapReason(result.reason);
  };

  const create = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zBookWriteInput>>
  ) => {
    const result = await getUseCases(ctx)
      .create({
        scope: ctx.scope,
        book: {
          title: data.title,
          author: data.author,
          genreId: toGenreId(data.genreId),
          publisher: data.publisher,
          coverId: data.coverId,
        },
      })
      .catch(mapAppErrorToServerFnError);
    if (result.ok) return result.value;
    return mapReason(result.reason);
  };

  const updateById = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zUpdateByIdInput>>
  ) => {
    const result = await getUseCases(ctx)
      .update({
        scope: ctx.scope,
        id: toBookId(data.id),
        book: {
          title: data.title,
          author: data.author,
          genreId: toGenreId(data.genreId),
          publisher: data.publisher,
          coverId: data.coverId,
        },
      })
      .catch(mapAppErrorToServerFnError);
    if (result.ok) return result.value;
    return mapReason(result.reason);
  };

  const deleteById = async (
    ctx: ProtectedContext,
    data: z.infer<ReturnType<typeof zDeleteByIdInput>>
  ) => {
    const result = await getUseCases(ctx)
      .delete({
        scope: ctx.scope,
        id: toBookId(data.id),
      })
      .catch(mapAppErrorToServerFnError);
    if (result.ok) return;
    return mapReason(result.reason);
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
