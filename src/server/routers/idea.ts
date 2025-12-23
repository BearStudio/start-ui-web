import { z } from 'zod';

import { zFormFieldsIdea, zGoodieIdea } from '@/features/goodies/schema';
import { protectedProcedure } from '@/server/orpc';

const tags = ['ideas'];

export default {
  getAll: protectedProcedure({
    permission: {
      idea: ['read'],
    },
  })
    .route({
      method: 'GET',
      path: '/ideas',
      tags,
    })
    .input(
      z
        .object({
          cursor: z.string().optional(),
          limit: z.coerce.number().int().min(1).max(100).prefault(20),
        })
        .prefault({})
    )
    .output(
      z.object({
        items: z.array(zGoodieIdea()),
        nextCursor: z.string().optional(),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }) => {
      const rows = await context.db.idea.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { name: 'asc' }, // OK si vous acceptez ce tri
        select: { id: true, name: true, category: true, description: true },
      });

      let nextCursor: string | undefined;
      if (rows.length > input.limit) {
        const nextItem = rows.pop();
        nextCursor = nextItem?.id;
      }

      const total = await context.db.idea.count();

      return {
        items: rows.map((r) => ({ ...r, description: r.description ?? '' })),
        nextCursor,
        total,
      };
    }),

  create: protectedProcedure({
    permission: {
      idea: ['create'],
    },
  })
    .route({
      method: 'POST',
      path: '/ideas',
      tags,
    })
    .input(zFormFieldsIdea())
    .output(zGoodieIdea())
    .handler(async ({ context, input }) => {
      context.logger.info('Add new idea');

      const created = await context.db.idea.create({
        data: {
          name: input.name,
          category: input.category,
          description: input.description,
        },
        select: { id: true, name: true, category: true, description: true },
      });
      return { ...created, description: created.description ?? '' };
    }),
};
