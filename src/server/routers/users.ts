import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { zUser } from '@/features/users/schemas';
import { ExtendedTRPCError } from '@/server/config/errors';
import { createTRPCRouter, protectedProcedure } from '@/server/config/trpc';

export const usersRouter = createTRPCRouter({
  getById: protectedProcedure({ authorizations: ['ADMIN'] })
    .meta({
      openapi: {
        method: 'GET',
        path: '/users/{id}',
        protect: true,
        tags: ['users'],
      },
    })
    .input(
      zUser().pick({
        id: true,
      })
    )
    .output(zUser())
    .query(async ({ ctx, input }) => {
      ctx.logger.info('Getting user');
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

  getAll: protectedProcedure({ authorizations: ['ADMIN'] })
    .meta({
      openapi: {
        method: 'GET',
        path: '/users',
        protect: true,
        tags: ['users'],
      },
    })
    .input(
      z
        .object({
          cursor: z.string().cuid().optional(),
          limit: z.number().min(1).max(100).default(20),
          searchTerm: z.string().optional(),
        })
        .default({})
    )
    .output(
      z.object({
        items: z.array(zUser()),
        nextCursor: z.string().cuid().optional(),
        total: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      ctx.logger.info('Getting users from database');

      const where = {
        OR: [
          {
            name: {
              contains: input.searchTerm,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: input.searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      } satisfies Prisma.UserWhereInput;

      const [total, items] = await ctx.db.$transaction([
        ctx.db.user.count({
          where,
        }),
        ctx.db.user.findMany({
          // Get an extra item at the end which we'll use as next cursor
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: {
            id: 'desc',
          },
          where,
        }),
      ]);

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
        total,
      };
    }),

  create: protectedProcedure({ authorizations: ['ADMIN'] })
    .meta({
      openapi: {
        method: 'POST',
        path: '/users',
        protect: true,
        tags: ['users'],
      },
    })
    .input(
      zUser().required().pick({
        name: true,
        email: true,
      })
    )
    .output(zUser())
    .mutation(async ({ ctx, input }) => {
      ctx.logger.info('Creating user');
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

  deactivate: protectedProcedure({ authorizations: ['ADMIN'] })
    .meta({
      openapi: {
        method: 'POST',
        path: '/users/{id}/deactivate',
        protect: true,
        tags: ['users'],
      },
    })
    .input(
      zUser().pick({
        id: true,
      })
    )
    .output(zUser())
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.id) {
        ctx.logger.warn('Logged user cannot deactivate itself');
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot deactivate yourself',
        });
      }

      ctx.logger.info('Deactivating user');
      return await ctx.db.user.update({
        where: { id: input.id },
        data: {
          accountStatus: 'DISABLED',
        },
      });
    }),

  activate: protectedProcedure({ authorizations: ['ADMIN'] })
    .meta({
      openapi: {
        method: 'POST',
        path: '/users/{id}/activate',
        protect: true,
        tags: ['users'],
      },
    })
    .input(
      zUser().pick({
        id: true,
      })
    )
    .output(zUser())
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.id) {
        ctx.logger.warn('Logged user cannot activate itself');
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot activate yourself',
        });
      }

      ctx.logger.info('Activating user');
      return await ctx.db.user.update({
        where: { id: input.id },
        data: {
          accountStatus: 'ENABLED',
        },
      });
    }),

  updateById: protectedProcedure({ authorizations: ['ADMIN'] })
    .meta({
      openapi: {
        method: 'PUT',
        path: '/users/{id}',
        protect: true,
        tags: ['users'],
      },
    })
    .input(
      zUser().required().pick({
        id: true,
        name: true,
        email: true,
        language: true,
        authorizations: true,
      })
    )
    .output(zUser())
    .mutation(async ({ ctx, input }) => {
      ctx.logger.info({ input }, 'Updating user');
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

  removeById: protectedProcedure({ authorizations: ['ADMIN'] })
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/users/{id}',
        protect: true,
        tags: ['users'],
      },
    })
    .input(
      zUser().required().pick({
        id: true,
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

      ctx.logger.info({ input }, 'Removing user');
      return await ctx.db.user.delete({
        where: { id: input.id },
      });
    }),
});
