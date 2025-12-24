import { ORPCError } from '@orpc/server';
import { z } from 'zod';

import {
  zFormFieldsGoodie,
  zGoodie,
  zGoodieDetail,
} from '@/features/goodies/schema';
import { protectedProcedure } from '@/server/orpc';

import { Prisma } from '../db/generated/client';

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
            ? (goodie.variants as unknown as GoodieVariant[])
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
  delete: protectedProcedure({
    permission: { goodie: ['delete'] },
  })
    .route({
      method: 'DELETE',
      path: '/goodies/:id',
      tags,
    })
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }) => {
      try {
        await context.db.goodie.delete({ where: { id: input.id } });
        return { success: true };
      } catch (error: unknown) {
        context.logger.error(error);
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),
  update: protectedProcedure({
    permission: { goodie: ['update'] },
  })
    .route({
      method: 'PATCH',
      path: '/goodies/:id',
      tags,
    })
    .input(
      z.object({
        id: z.string(),
        data: zFormFieldsGoodie(),
      })
    )
    .output(zGoodie())
    .handler(async ({ context, input }) => {
      try {
        const variants: GoodieVariant[] =
          input.data.variants?.map((v) => ({
            key: v.key,
            size: v.size ?? null,
            color: v.color ?? null,
            stockQty: v.stockQty ?? 0,
          })) ?? [];

        const total =
          variants.length > 0
            ? variants.reduce((sum, v) => sum + (v.stockQty ?? 0), 0)
            : (input.data.total ?? null);

        const goodie = await context.db.goodie.update({
          where: { id: input.id },
          data: {
            name: input.data.name,
            edition: input.data.edition ?? null,
            category: input.data.category,
            description: input.data.description ?? null,
            photoUrl: input.data.photoUrl ?? null,
            variants,
            total,
            releaseLabel: input.data.releaseLabel ?? null,
            releaseDate: input.data.releaseDate ?? null,
          },
        });

        return {
          ...goodie,
          variants: Array.isArray(goodie.variants)
            ? (goodie.variants as GoodieVariant[])
            : [],
        };
      } catch (error: unknown) {
        context.logger.error(error);
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),
  getGoodieById: protectedProcedure({
    permission: {
      goodie: ['read'],
    },
  })
    .route({
      method: 'GET',
      path: '/goodies/:id',
    })
    .input(z.object({ id: z.string() }))
    .output(zGoodieDetail())
    .handler(async ({ context, input }) => {
      const goodie = await context.db.goodie.findUnique({
        where: { id: input.id },
        include: {
          assets: true,
          grants: true,
        },
      });

      if (!goodie) {
        throw new Error('Goodie introuvable');
      }

      return {
        ...goodie,
        variants: Array.isArray(goodie.variants)
          ? (goodie.variants as GoodieVariant[])
          : [],
        total:
          goodie.total ??
          (goodie.variants as { stockQty?: number }[]).reduce(
            (sum, v) => sum + (v.stockQty ?? 0),
            0
          ),
      };
    }),
};
