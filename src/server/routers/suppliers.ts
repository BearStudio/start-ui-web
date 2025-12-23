import { ORPCError } from '@orpc/client';
import { z } from 'zod';

import { zFormFieldsSupplier, zSupplier } from '@/features/goodies/schema';
import { Prisma } from '@/server/db/generated/client';
import { protectedProcedure } from '@/server/orpc';

const tags = ['suppliers'];

export default {
  getAllSuppliers: protectedProcedure({
    permission: { supplier: ['read'] },
  })
    .route({
      method: 'GET',
      path: '/suppliers',
      tags,
    })
    .output(z.array(zSupplier()))
    .handler(async ({ context }) => {
      return context.db.supplier.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }),

  createSupplier: protectedProcedure({
    permission: { supplier: ['create'] },
  })
    .route({
      method: 'POST',
      path: '/suppliers',
      tags,
    })
    .input(zFormFieldsSupplier())
    .output(zSupplier())
    .handler(async ({ context, input }) => {
      try {
        return await context.db.supplier.create({
          data: input,
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new ORPCError('INTERNAL_SERVER_ERROR');
        }
        throw error;
      }
    }),

  deletSupplierById: protectedProcedure({
    permission: { supplier: ['delete'] },
  })
    .route({
      method: 'DELETE',
      path: '/suppliers/{id}',
      tags,
    })
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      try {
        await context.db.supplier.delete({
          where: { id: input.id },
        });
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),
};
