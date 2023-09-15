import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { adminProcedure, createTRPCRouter } from '@/server/api/trpc';

const zRole = () => z.enum(['USER', 'ADMIN']);

export const usersRouter = createTRPCRouter({
  getById: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
        });
      }

      return user;
    }),

  getAll: adminProcedure
    .input(
      z.object({
        page: z.number().int().gte(1).default(1),
        size: z.number().int().gte(1).default(20),
        sort: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const [items, total] = await Promise.all([
        ctx.db.user.findMany({
          skip: (input.page - 1) * input.size,
          take: input.size,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        ctx.db.user.count(),
      ]);
      return {
        items,
        total,
      };
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.create({
        data: input,
      });
    }),

  deactivate: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.id === input.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot deactivate yourself',
        });
      }

      await ctx.db.user.update({
        where: { id: input.id },
        data: {
          activated: false,
        },
      });
    }),

  activate: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.id === input.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot activate yourself',
        });
      }
      await ctx.db.user.update({
        where: { id: input.id },
        data: {
          activated: true,
        },
      });
    }),

  updateById: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
        language: z.string(),
        role: zRole(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: input.id },
        data: input,
      });
    }),

  removeById: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.id === input.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot remove yourself',
        });
      }
      return ctx.db.user.delete({
        where: { id: input.id },
      });
    }),
});
