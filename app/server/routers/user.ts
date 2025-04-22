import { ORPCError } from '@orpc/client';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

import { zSession, zUser } from '@/features/user/schema';
import { protectedProcedure } from '@/server/orpc';

const tags = ['user'];

export default {
  getAll: protectedProcedure({
    permission: {
      user: ['list'],
    },
  })
    .route({
      method: 'GET',
      path: '/users',
      tags,
    })
    .input(
      z
        .object({
          cursor: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
          searchTerm: z.string().optional(),
        })
        .default({})
    )
    .output(
      z.object({
        items: z.array(zUser()),
        nextCursor: z.string().optional(),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }) => {
      const where = {
        name: {
          contains: input.searchTerm,
          mode: 'insensitive',
        },
      } satisfies Prisma.UserWhereInput;

      context.logger.info('Getting users from database');
      const [total, items] = await context.db.$transaction([
        context.db.user.count({
          where,
        }),
        context.db.user.findMany({
          // Get an extra item at the end which we'll use as next cursor
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: {
            name: 'asc',
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

  getById: protectedProcedure({
    permission: {
      user: ['list'],
    },
  })
    .route({
      method: 'GET',
      path: '/users/{id}',
      tags,
    })
    .input(
      z.object({
        id: z.string(),
      })
    )
    .output(zUser())
    .handler(async ({ context, input }) => {
      context.logger.info('Getting user');
      const user = await context.db.user.findUnique({
        where: { id: input.id },
      });

      if (!user) {
        context.logger.warn('Unable to find user with the provided input');
        throw new ORPCError('NOT_FOUND');
      }

      return user;
    }),

  getUserSessions: protectedProcedure({
    permission: {
      session: ['list'],
    },
  })
    .route({
      method: 'GET',
      path: '/users/{id}/sessions',
      tags,
    })
    .input(
      z.object({
        userId: z.string(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .output(
      z.object({
        items: z.array(zSession()),
        nextCursor: z.string().optional(),
        total: z.number(),
      })
    )
    .handler(async ({ context, input }) => {
      const where = {
        userId: input.userId,
      } satisfies Prisma.SessionWhereInput;

      context.logger.info('Getting user sessions from database');
      const [total, items] = await context.db.$transaction([
        context.db.session.count({
          where,
        }),
        context.db.session.findMany({
          // Get an extra item at the end which we'll use as next cursor
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: {
            createdAt: 'desc',
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
};
