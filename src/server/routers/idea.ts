import { z } from 'zod';

import {
  zFormFieldsIdea,
  zGoodieCategory,
  zGoodieIdea,
} from '@/features/goodies/schema';
import { protectedProcedure } from '@/server/orpc';

const tags = ['ideas'];

export default {
  //Get All ideas
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

  //Create a new idea
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

  //Update an idea
  update: protectedProcedure({
    permission: {
      idea: ['update'],
    },
  })
    .route({
      method: 'PATCH',
      path: '/ideas',
      tags,
    })
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        category: zGoodieCategory,
        description: z.string(),
      })
    )
    .output(zGoodieIdea())
    .handler(async ({ context, input }) => {
      context.logger.info('Update an idea');

      const created = await context.db.idea.update({
        where: { id: input.id },
        data: {
          name: input.name,
          category: input.category,
          description: input.description,
        },
        select: { id: true, name: true, category: true, description: true },
      });
      return { ...created, description: created.description ?? '' };
    }),

  //Delete an idea
  delete: protectedProcedure({
    permission: {
      idea: ['delete'],
    },
  })
    .route({
      method: 'DELETE',
      path: '/ideas',
      tags,
    })
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string() }))
    .handler(async ({ context, input }) => {
      context.logger.info('Delete an idea idea');
      await context.db.idea.delete({ where: { id: input.id } });
      return { id: input.id };
    }),
};
