import { and, asc, eq, gt, ilike, or, sql } from 'drizzle-orm';
import { z } from 'zod';

import { zBook, zFormFieldsBook } from '@/features/book/schema';
import { book } from '@/server/db/schema';
import {
  assertPermission,
  type ProtectedContext,
} from '@/server/middlewares.server';
import { ServerFnError } from '@/server/server-fn-error';

export const zGetAllInput = () =>
  z
    .object({
      cursor: z.string().optional(),
      limit: z.coerce.number().int().min(1).max(100).prefault(20),
      searchTerm: z.string().trim().optional().prefault(''),
    })
    .prefault({});

const getAll = async (
  ctx: ProtectedContext,
  data: z.output<ReturnType<typeof zGetAllInput>>
) => {
  await assertPermission(ctx.user.id, { book: ['read'] });

  ctx.logger.info('Getting books from database');

  const searchPattern = `%${data.searchTerm}%`;
  const searchFilter = data.searchTerm
    ? or(ilike(book.title, searchPattern), ilike(book.author, searchPattern))
    : undefined;

  const cursorRow = data.cursor
    ? await ctx.db.query.book.findFirst({
        where: eq(book.id, data.cursor),
        columns: { id: true, title: true },
      })
    : undefined;

  if (data.cursor && !cursorRow) {
    const [totalResult] = await ctx.db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(book)
      .where(searchFilter);

    return {
      items: [],
      nextCursor: undefined,
      total: totalResult?.count ?? 0,
    };
  }

  const cursorFilter = cursorRow
    ? or(
        gt(book.title, cursorRow.title),
        and(eq(book.title, cursorRow.title), gt(book.id, cursorRow.id))
      )
    : undefined;

  const where = and(searchFilter, cursorFilter);

  const [total, items] = await Promise.all([
    ctx.db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(book)
      .where(searchFilter),
    ctx.db.query.book.findMany({
      where,
      orderBy: [asc(book.title), asc(book.id)],
      limit: data.limit + 1,
      with: { genre: true },
    }),
  ]);

  let nextCursor: typeof data.cursor | undefined = undefined;
  if (items.length > data.limit) {
    const nextItem = items.pop();
    nextCursor = nextItem?.id;
  }

  return { items, nextCursor, total: total[0]?.count ?? 0 };
};

export const zGetByIdInput = () => z.object({ id: z.string() });

const getById = async (
  ctx: ProtectedContext,
  data: z.infer<ReturnType<typeof zGetByIdInput>>
) => {
  await assertPermission(ctx.user.id, { book: ['read'] });

  ctx.logger.info('Getting book');
  const result = await ctx.db.query.book.findFirst({
    where: eq(book.id, data.id),
    with: { genre: true },
  });

  if (!result) {
    ctx.logger.warn('Unable to find book with the provided input');
    throw new ServerFnError('NOT_FOUND');
  }

  return result;
};

const create = async (
  ctx: ProtectedContext,
  data: z.infer<ReturnType<typeof zFormFieldsBook>>
) => {
  await assertPermission(ctx.user.id, { book: ['create'] });

  ctx.logger.info('Create book');
  const [created] = await ctx.db
    .insert(book)
    .values({
      title: data.title,
      author: data.author,
      genreId: data.genreId,
      publisher: data.publisher,
      coverId: data.coverId,
    })
    .returning();

  if (!created) {
    throw new ServerFnError('INTERNAL_SERVER_ERROR');
  }

  return created;
};

export const zUpdateByIdInput = () =>
  zFormFieldsBook().extend({ id: z.string() });

const updateById = async (
  ctx: ProtectedContext,
  data: z.infer<ReturnType<typeof zUpdateByIdInput>>
) => {
  await assertPermission(ctx.user.id, { book: ['update'] });

  ctx.logger.info('Update book');
  const [updated] = await ctx.db
    .update(book)
    .set({
      title: data.title,
      author: data.author,
      genreId: data.genreId,
      publisher: data.publisher ?? null,
      coverId: data.coverId ?? null,
    })
    .where(eq(book.id, data.id))
    .returning();

  if (!updated) {
    throw new ServerFnError('NOT_FOUND');
  }

  return updated;
};

export const zDeleteByIdInput = () => zBook().pick({ id: true });

const deleteById = async (
  ctx: ProtectedContext,
  data: z.infer<ReturnType<typeof zDeleteByIdInput>>
) => {
  await assertPermission(ctx.user.id, { book: ['delete'] });

  ctx.logger.info('Delete book');
  const [deleted] = await ctx.db
    .delete(book)
    .where(eq(book.id, data.id))
    .returning({ id: book.id });

  if (!deleted) {
    throw new ServerFnError('NOT_FOUND');
  }
};

export type BookHandlers = {
  getAll: typeof getAll;
  getById: typeof getById;
  create: typeof create;
  updateById: typeof updateById;
  deleteById: typeof deleteById;
};

export const handlers: BookHandlers = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};
