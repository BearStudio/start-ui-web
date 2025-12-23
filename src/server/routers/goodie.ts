import { z } from 'zod';

import {
  zFormFieldsIdea,
  zGoodieDetail,
  zGoodieIdea,
} from '@/features/goodies/schema';
import { protectedProcedure } from '@/server/orpc';

const tags = ['goodies'];

type GoodieVariant = {
  key: string;
  size?: string | null;
  color?: string | null;
  stockQty?: number;
};

export default {
  getAll: protectedProcedure({
    permission: {
      goodie: ['read'],
    },
  })
    .route({
      method: 'GET',
      path: '/goodies',
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
        items: z.array(zGoodieDetail()),
        nextCursor: z.string().optional(),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }) => {
      context.logger.info('Getting all goodies from database');

      const items = await context.db.goodie.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { name: 'asc' },
        include: {
          assets: true,
          grants: true,
        },
      });

      const mappedItems = items.map((g) => ({
        ...g,
        variants: Array.isArray(g.variants)
          ? (g.variants as unknown as GoodieVariant[])
          : [],
        total:
          g.total ??
          (g.variants as GoodieVariant[]).reduce(
            (sum, v) => sum + (v.stockQty ?? 0),
            0
          ),
      }));

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (mappedItems.length > input.limit) {
        const nextItem = mappedItems.pop();
        nextCursor = nextItem?.id;
      }

      const total = await context.db.goodie.count();

      return {
        items: mappedItems,
        nextCursor,
        total,
      };
    }),

  createIdea: protectedProcedure({
    permission: {
      goodie: ['create'],
    },
  })
    .route({
      method: 'POST',
      path: '/goodies',
      tags,
    })
    .input(zFormFieldsIdea())
    .output(zGoodieIdea())
    .handler(async ({ context, input }) => {
      context.logger.info('Add new idea');

      const created = await context.db.goodie.create({
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
