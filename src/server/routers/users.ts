import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { ExtendedTRPCError } from '@/server/config/errors';
import { adminProcedure, createTRPCRouter } from '@/server/config/trpc';

export const zUserRole = () => z.enum(['USER', 'ADMIN']).catch('USER');

const zUser = () =>
  z.object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    name: z.string().nullish(),
    email: z.string(),
    activated: z.boolean(),
    role: zUserRole(),
    language: z.string(),
  });

export const usersRouter = createTRPCRouter({
  getById: adminProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/users/{id}',
        protect: true,
        tags: ['users'],
      },
    })
    .input(z.object({ id: z.string().cuid() }))
    .output(zUser())
    .query(async ({ ctx, input }) => {
      ctx.logger.debug({ input }, 'Getting user');
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
      });

      if (!user) {
        ctx.logger.warn('Unable to find user with the provided input');
        throw new TRPCError({
          code: 'NOT_FOUND',
        });
      }

      return user;
    }),

  getAll: adminProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/users',
        protect: true,
        tags: ['users'],
      },
    })
    .input(
      z.object({
        page: z.number().int().gte(1).default(1),
        size: z.number().int().gte(1).default(20),
      })
    )
    .output(
      z.object({
        items: z.array(zUser()),
        total: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      ctx.logger.debug({ input }, 'Getting users using pagination');
      const [items, total] = await Promise.all([
        ctx.db.user.findMany({
          skip: (input.page - 1) * input.size,
          take: input.size,
          orderBy: {
            id: 'desc',
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
    .meta({
      openapi: {
        method: 'POST',
        path: '/users',
        protect: true,
        tags: ['users'],
      },
    })
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
      })
    )
    .output(zUser())
    .mutation(async ({ ctx, input }) => {
      ctx.logger.debug('Creating user');
      try {
        return await ctx.db.user.create({
          data: input,
        });
      } catch (e) {
        throw new ExtendedTRPCError({
          cause: e,
        });
      }
    }),

  deactivate: adminProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/users/{id}/deactivate',
        protect: true,
        tags: ['users'],
      },
    })
    .input(z.object({ id: z.string().cuid() }))
    .output(zUser())
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.id) {
        ctx.logger.warn('Logged user cannot deactivate itself');
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot deactivate yourself',
        });
      }

      ctx.logger.debug('Deactivating user');
      return await ctx.db.user.update({
        where: { id: input.id },
        data: {
          activated: false,
        },
      });
    }),

  activate: adminProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/users/{id}/activate',
        protect: true,
        tags: ['users'],
      },
    })
    .input(z.object({ id: z.string().cuid() }))
    .output(zUser())
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.id) {
        ctx.logger.warn('Logged user cannot activate itself');
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot activate yourself',
        });
      }

      ctx.logger.debug('Activating user');
      return await ctx.db.user.update({
        where: { id: input.id },
        data: {
          activated: true,
          status: 'VERIFIED',
        },
      });
    }),

  updateById: adminProcedure
    .meta({
      openapi: {
        method: 'PUT',
        path: '/users/{id}',
        protect: true,
        tags: ['users'],
      },
    })
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
        language: z.string(),
        role: zUserRole(),
      })
    )
    .output(zUser())
    .mutation(async ({ ctx, input }) => {
      ctx.logger.debug({ input }, 'Updating user');
      try {
        return await ctx.db.user.update({
          where: { id: input.id },
          data: input,
        });
      } catch (e) {
        throw new ExtendedTRPCError({
          cause: e,
        });
      }
    }),

  removeById: adminProcedure
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/users/{id}',
        protect: true,
        tags: ['users'],
      },
    })
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .output(zUser())
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.id) {
        ctx.logger.warn('Logged user cannot delete itself');
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot remove yourself',
        });
      }

      ctx.logger.debug({ input }, 'Removing user');
      return await ctx.db.user.delete({
        where: { id: input.id },
      });
    }),
});
