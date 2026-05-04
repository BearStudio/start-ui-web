import { and, asc, eq, gt, ilike, or, sql } from 'drizzle-orm';
import { z } from 'zod';

import { genre } from '@/server/db/schema';
import {
  assertPermission,
  type ProtectedContext,
} from '@/server/middlewares.server';

export const zGetAllInput = () =>
  z
    .object({
      cursor: z.string().optional(),
      limit: z.coerce.number().int().min(1).max(100).prefault(20),
      searchTerm: z.string().optional(),
    })
    .prefault({});

const getAll = async (
  ctx: ProtectedContext,
  data: z.output<ReturnType<typeof zGetAllInput>>
) => {
  await assertPermission(ctx.user.id, { genre: ['read'] });

  ctx.logger.info('Getting genres from database');

  const searchFilter = data.searchTerm
    ? ilike(genre.name, `%${data.searchTerm}%`)
    : undefined;

  const cursorRow = data.cursor
    ? await ctx.db.query.genre.findFirst({
        where: eq(genre.id, data.cursor),
        columns: { id: true, name: true },
      })
    : undefined;

  if (data.cursor && !cursorRow) {
    const [totalResult] = await ctx.db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(genre)
      .where(searchFilter);

    return {
      items: [],
      nextCursor: undefined,
      total: totalResult?.count ?? 0,
    };
  }

  const cursorFilter = cursorRow
    ? or(
        gt(genre.name, cursorRow.name),
        and(eq(genre.name, cursorRow.name), gt(genre.id, cursorRow.id))
      )
    : undefined;

  const where = and(searchFilter, cursorFilter);

  const [total, items] = await Promise.all([
    ctx.db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(genre)
      .where(searchFilter),
    ctx.db.query.genre.findMany({
      where,
      orderBy: [asc(genre.name), asc(genre.id)],
      limit: data.limit + 1,
    }),
  ]);

  let nextCursor: typeof data.cursor | undefined = undefined;
  if (items.length > data.limit) {
    const nextItem = items.pop();
    nextCursor = nextItem?.id;
  }

  return { items, nextCursor, total: total[0]?.count ?? 0 };
};

export type GenreHandlers = {
  getAll: typeof getAll;
};

export const handlers: GenreHandlers = {
  getAll,
};
