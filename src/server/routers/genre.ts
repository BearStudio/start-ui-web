import { and, asc, eq, gt, gte, ilike, or, sql } from 'drizzle-orm';
import { z } from 'zod';

import { zGenre } from '@/features/genre/schema';
import { genre } from '@/server/db/schema';
import { protectedProcedure } from '@/server/orpc';

const tags = ['genres'];

export default {
  getAll: protectedProcedure({
    permissions: {
      genre: ['read'],
    },
  })
    .route({
      method: 'GET',
      path: '/genres',
      tags,
    })
    .input(
      z
        .object({
          cursor: z.string().optional(),
          limit: z.coerce.number().int().min(1).max(100).prefault(20),
          searchTerm: z.string().optional(),
        })
        .prefault({})
    )
    .output(
      z.object({
        items: z.array(zGenre()),
        nextCursor: z.string().optional(),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }) => {
      context.logger.info('Getting genres from database');

      const searchFilter = input.searchTerm
        ? ilike(genre.name, `%${input.searchTerm}%`)
        : undefined;

      const cursorRow = input.cursor
        ? await context.db.query.genre.findFirst({
            where: eq(genre.id, input.cursor),
            columns: { id: true, name: true },
          })
        : undefined;

      const cursorFilter = cursorRow
        ? or(
            gt(genre.name, cursorRow.name),
            and(eq(genre.name, cursorRow.name), gte(genre.id, cursorRow.id))
          )
        : undefined;

      const where = and(searchFilter, cursorFilter);

      const [totalResult, items] = await Promise.all([
        context.db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(genre)
          .where(searchFilter),
        context.db.query.genre.findMany({
          where: where,
          orderBy: [asc(genre.name), asc(genre.id)],
          limit: input.limit + 1,
        }),
      ]);

      const total = totalResult[0]?.count ?? 0;

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
        total,
      };
    }),
};
