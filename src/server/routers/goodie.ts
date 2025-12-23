import { ORPCError } from '@orpc/server';
import { z } from 'zod';

import {
  zFormFieldsIdea,
  zGoodieDetail,
  zGoodieIdea,
} from '@/features/goodies/schema';
import { zFormFieldsGoodie, zGoodie } from '@/features/goodies/schema';
import { Prisma } from '@/server/db/generated/client';
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
          ? (g.variants as GoodieVariant[])
          : undefined,
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
  create: protectedProcedure({
    permission: {
      goodie: ['create'],
    },
  })
    .route({
      method: 'POST',
      path: '/goodies',
      tags,
    })
    .input(zFormFieldsGoodie())
    .output(zGoodie())
    .handler(async ({ context, input }) => {
      context.logger.info('Create goodie');

      try {
        const variants: GoodieVariant[] =
          input.variants?.map((v) => ({
            key: v.key,
            size: v.size ?? null,
            color: v.color ?? null,
            stockQty: v.stockQty ?? 0,
          })) ?? [];

        const total =
          variants.length > 0
            ? variants.reduce((sum, v) => sum + (v.stockQty ?? 0), 0)
            : (input.total ?? null);

        const goodie = await context.db.goodie.create({
          data: {
            name: input.name,
            edition: input.edition ?? null,
            category: input.category,
            description: input.description ?? null,
            photoUrl: input.photoUrl ?? null,

            variants,
            total,

            releaseLabel: input.releaseLabel ?? null,
            releaseDate: input.releaseDate ?? null,
          },
        });

        return {
          ...goodie,
          variants: Array.isArray(goodie.variants)
            ? (goodie.variants as GoodieVariant[])
            : [],
        };
      } catch (error: unknown) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ORPCError('CONFLICT', {
            data: {
              target: error.meta?.target,
            },
          });
        }

        context.logger.error(error);
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),
};
