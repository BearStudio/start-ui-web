import { and, asc, gt, like } from 'drizzle-orm';
import { z } from 'zod';

import { zGenre } from '@/features/genre/schema';
import { dbSchemas } from '@/server/db';
import { protectedProcedure } from '@/server/orpc';

const tags = ['genres'];

export default {
  getAll: protectedProcedure({
    permission: {
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
          limit: z.coerce.number().int().min(1).max(100).default(20),
          searchTerm: z.string().optional(),
        })
        .default({})
    )
    .output(
      z.object({
        items: z.array(zGenre()),
        nextCursor: z.string().cuid().optional(),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }) => {
      context.logger.info('Getting genre from database');

      const whereSearchTerm = input.searchTerm
        ? like(dbSchemas.genre.name, `%${input.searchTerm}%`)
        : undefined;
      const [total, items] = await context.db.transaction(async (tr) => [
        await tr.$count(dbSchemas.genre, whereSearchTerm),
        await tr.query.genre.findMany({
          where: and(
            input.cursor ? gt(dbSchemas.genre.id, input.cursor) : undefined,
            whereSearchTerm
          ),
          orderBy: asc(dbSchemas.genre.name),
          limit: input.limit + 1,
        }),
      ]);

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
