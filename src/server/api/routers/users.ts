import { User } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { adminProcedure, createTRPCRouter } from '@/server/api/trpc';
import { prismaThrowFormatedTRPCError } from '@/server/db';

const zRole = () => z.enum(['USER', 'ADMIN']);

export const formatUser = <U extends User>(user: U) => {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    password, // Drop password
    role,
    ...partialUser
  } = user;
  return {
    ...partialUser,
    role: zRole().catch('USER').parse(role),
  };
};

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

      return formatUser(user);
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
        items: items.map(formatUser),
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
      try {
        const user = await ctx.db.user.create({
          data: input,
        });
        return formatUser(user);
      } catch (e) {
        prismaThrowFormatedTRPCError(e);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),

  deactivate: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot deactivate yourself',
        });
      }

      const user = await ctx.db.user.update({
        where: { id: input.id },
        data: {
          activated: false,
        },
      });

      return formatUser(user);
    }),

  activate: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot activate yourself',
        });
      }
      const user = await ctx.db.user.update({
        where: { id: input.id },
        data: {
          activated: true,
        },
      });
      return formatUser(user);
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
      try {
        const user = await ctx.db.user.update({
          where: { id: input.id },
          data: input,
        });
        return formatUser(user);
      } catch (e) {
        prismaThrowFormatedTRPCError(e);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
    }),

  removeById: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot remove yourself',
        });
      }
      const user = await ctx.db.user.delete({
        where: { id: input.id },
      });
      return formatUser(user);
    }),
});
