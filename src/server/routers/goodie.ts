import { z } from 'zod';

import { zGoodieDetail } from '@/features/goodies/schema';
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

      // Mapping des variants pour TypeScript + sécurité runtime
      const mappedItems = items.map((g) => ({
        ...g,
        variants: Array.isArray(g.variants)
          ? (g.variants as unknown as GoodieVariant[])
          : [],
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
};
