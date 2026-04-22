import { z } from 'zod';

import { zGenre } from '@/features/genre/schema';
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

      const where = {
        name: {
          contains: input.searchTerm,
          mode: 'insensitive',
        },
      };

      const [total, items] = await Promise.all([
        context.db.genre.count({
          where,
        }),
        context.db.genre.findMany({
          // Get an extra item at the end which we'll use as next cursor
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: {
            name: 'asc',
          },
          where,
        }),
      ]);

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        items.pop();
        nextCursor = items.at(-1)?.id;
      }

      return {
        items,
        nextCursor,
        total,
      };
    }),
};
