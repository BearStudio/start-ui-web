import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import { zAsset, zFormFieldsAsset } from '@/features/goodies/schema';
import { Prisma } from '@/server/db/generated/client';
import { protectedProcedure } from '@/server/orpc';

const tags = ['assets'];

export default {
  getAllAssets: protectedProcedure({
    permission: { asset: ['read'] },
  })
    .route({
      method: 'GET',
      path: '/assets',
      tags,
    })
    .output(z.array(zAsset))
    .handler(async ({ context }) => {
      return context.db.asset.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }),

  createAsset: protectedProcedure({
    permission: { asset: ['create'] },
  })
    .route({
      method: 'POST',
      path: '/assets',
      tags,
    })
    .input(zFormFieldsAsset)
    .output(zAsset)
    .handler(async ({ context, input }) => {
      try {
        return await context.db.asset.create({
          data: input,
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new ORPCError('INTERNAL_SERVER_ERROR');
        }
        throw error;
      }
    }),

  deletAssetById: protectedProcedure({
    permission: { asset: ['delete'] },
  })
    .route({
      method: 'DELETE',
      path: '/assets/{id}',
      tags,
    })
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      try {
        await context.db.asset.delete({
          where: { id: input.id },
        });
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),
};
