import { Prisma } from '@prisma/client';
import { z } from 'zod';

import { zRepository } from '@/features/repository/schemas';
import { protectedProcedure } from '@/server/orpc';

const tags = ['repositories'];

export default {
  getAll: protectedProcedure({
    permission: {
      repository: ['read'],
    },
  })
    .route({
      method: 'GET',
      path: '/repositories',
      tags,
    })
    .input(
      z
        .object({
          cursor: z.string().cuid().optional(),
          limit: z.number().min(1).max(100).default(20),
          searchTerm: z.string().optional(),
        })
        .default({})
    )
    .output(
      z.object({
        items: z.array(zRepository()),
        nextCursor: z.string().cuid().optional(),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }) => {
      context.logger.info('Getting repositories from database');

      const where = {
        name: {
          contains: input.searchTerm,
          mode: 'insensitive',
        },
      } satisfies Prisma.RepositoryWhereInput;

      const [total, items] = await context.db.$transaction([
        context.db.repository.count({
          where,
        }),
        context.db.repository.findMany({
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
