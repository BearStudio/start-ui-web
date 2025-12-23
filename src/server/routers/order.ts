import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import {
  zFormFieldsGoodieOrder,
  zGoodieOrder,
} from '@/features/goodies/schema';
import { Prisma } from '@/server/db/generated/client';
import { protectedProcedure } from '@/server/orpc';

const tags = ['orders'];

export default {
  getAllGoodieOrders: protectedProcedure({
    permission: { order: ['read'] },
  })
    .route({
      method: 'GET',
      path: '/goodie-orders',
      tags,
    })
    .output(z.array(zGoodieOrder()))
    .handler(async ({ context }) => {
      return context.db.goodieOrder.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          madeBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    }),

  createGoodieOrder: protectedProcedure({
    permission: { order: ['create'] },
  })
    .route({
      method: 'POST',
      path: '/goodie-orders',
      tags,
    })
    .input(zFormFieldsGoodieOrder())
    .output(zGoodieOrder())
    .handler(async ({ context, input }) => {
      try {
        return await context.db.goodieOrder.create({
          data: {
            ...input,
            requestedAt: new Date(),
          },
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new ORPCError('INTERNAL_SERVER_ERROR');
        }
        throw error;
      }
    }),

  deleteGoodieOrderById: protectedProcedure({
    permission: { order: ['delete'] },
  })
    .route({
      method: 'DELETE',
      path: '/goodie-orders/{id}',
      tags,
    })
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      try {
        await context.db.goodieOrder.delete({
          where: { id: input.id },
        });
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),
};
