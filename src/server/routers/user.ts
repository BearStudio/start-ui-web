import { ORPCError } from '@orpc/client';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { and, asc, desc, eq, gt, like, or } from 'drizzle-orm';
import { z } from 'zod';

import { zSession, zUser } from '@/features/user/schema';
import { auth } from '@/server/auth';
import { dbSchemas } from '@/server/db';
import { protectedProcedure } from '@/server/orpc';

const tags = ['users'];

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
          limit: z.coerce.number().int().min(1).max(100).default(20),
          searchTerm: z.string().trim().optional().default(''),
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
      context.logger.info('Getting users from database');

      const whereSearchTerm = input.searchTerm
        ? or(
            like(dbSchemas.user.name, `%${input.searchTerm}%`),
            like(dbSchemas.user.email, `%${input.searchTerm}%`)
          )
        : undefined;
      const [total, items] = await context.db.transaction(async (tr) => [
        await tr.$count(dbSchemas.user, whereSearchTerm),
        await tr.query.user.findMany({
          where: and(
            input.cursor ? gt(dbSchemas.user.id, input.cursor) : undefined,
            whereSearchTerm
          ),
          orderBy: asc(dbSchemas.user.name),
          limit: input.limit + 1,
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
      const item = await context.db.query.user.findFirst({
        where: eq(dbSchemas.user.id, input.id),
      });

      if (!item) {
        context.logger.warn('Unable to find user with the provided input');
        throw new ORPCError('NOT_FOUND');
      }

      return item;
    }),

  updateById: protectedProcedure({
    permission: {
      user: ['set-role'],
    },
  })
    .route({
      method: 'POST',
      path: '/users/{id}',
      tags,
    })
    .input(
      zUser().pick({
        id: true,
        name: true,
        email: true,
        role: true,
      })
    )
    .output(zUser())
    .handler(async ({ context, input }) => {
      context.logger.info('Getting current user email');
      const currentUser = await context.db.query.user.findFirst({
        where: eq(dbSchemas.user.id, input.id),
        columns: {
          email: true,
        },
      });

      if (!currentUser) {
        context.logger.warn('Unable to find user with the provided input');
        throw new ORPCError('NOT_FOUND');
      }

      context.logger.info('Update user');
      try {
        const [item] = await context.db
          .update(dbSchemas.user)
          .set({
            name: input.name ?? '',
            // Prevent to change role of the connected user
            role: context.user.id === input.id ? undefined : input.role,
            email: input.email,
            // Set email as verified if admin changed the email
            emailVerified: currentUser.email !== input.email ? true : undefined,
          })
          .where(eq(dbSchemas.user.id, input.id))
          .returning();

        if (!item) {
          context.logger.error('Unable to get the returning user from update');
          throw new ORPCError('INTERNAL_SERVER_ERROR');
        }
        return item;
      } catch {
        // TODO conflict
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

  create: protectedProcedure({
    permission: {
      user: ['create'],
    },
  })
    .route({
      method: 'POST',
      path: '/users',
      tags,
    })
    .input(
      zUser().pick({
        name: true,
        email: true,
        role: true,
      })
    )
    .output(zUser())
    .handler(async ({ context, input }) => {
      context.logger.info('Create user');
      try {
        const [item] = await context.db
          .insert(dbSchemas.user)
          .values({
            email: input.email,
            emailVerified: true,
            name: input.name ?? '',
            role: input.role ?? 'user',
          })
          .returning();
        if (!item) {
          context.logger.error('Unable to get the returning user from insert');
          throw new ORPCError('INTERNAL_SERVER_ERROR');
        }
        return item;
      } catch {
        // TODO conflict
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

  deleteById: protectedProcedure({
    permission: {
      user: ['delete'],
    },
  })
    .route({
      method: 'DELETE',
      path: '/users/{id}',
      tags,
    })
    .input(
      zUser().pick({
        id: true,
      })
    )
    .output(z.void())
    .handler(async ({ context, input }) => {
      if (context.user.id === input.id) {
        context.logger.warn('Prevent to delete the current connected user');
        throw new ORPCError('BAD_REQUEST', {
          message: 'You cannot delete yourself',
        });
      }

      context.logger.info('Delete user');
      const response = await auth.api.removeUser({
        body: {
          userId: input.id,
        },
        headers: getRequestHeaders(),
      });

      if (!response.success) {
        context.logger.error('Failed to delete the user');
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

  getUserSessions: protectedProcedure({
    permission: {
      session: ['list'],
    },
  })
    .route({
      method: 'GET',
      path: '/users/{userId}/sessions',
      tags,
    })
    .input(
      z.object({
        userId: z.string(),
        cursor: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(100).default(20),
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
      context.logger.info('Getting user sessions from database');

      const [total, items] = await context.db.transaction(async (tr) => [
        await tr.$count(dbSchemas.session),
        await tr.query.session.findMany({
          where: and(
            input.cursor ? gt(dbSchemas.session.id, input.cursor) : undefined
          ),
          orderBy: desc(dbSchemas.session.createdAt),
          limit: input.limit + 1,
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

  revokeUserSessions: protectedProcedure({
    permission: {
      session: ['revoke'],
    },
  })
    .route({
      method: 'POST',
      path: '/users/{id}/sessions/revoke',
      tags,
    })
    .input(
      z.object({
        id: z.string(),
      })
    )
    .output(z.void())
    .handler(async ({ context, input }) => {
      if (context.user.id === input.id) {
        context.logger.warn(
          'Prevent to revoke all sesssions of the current connected user'
        );
        throw new ORPCError('BAD_REQUEST', {
          message: 'You cannot revoke all your sessions',
        });
      }

      context.logger.info('Revoke all user sessions');
      const response = await auth.api.revokeUserSessions({
        body: {
          userId: input.id,
        },
        headers: getRequestHeaders(),
      });

      if (!response.success) {
        context.logger.error('Failed to revoke all the user sessions');
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

  revokeUserSession: protectedProcedure({
    permission: {
      session: ['revoke'],
    },
  })
    .route({
      method: 'POST',
      path: '/users/{id}/sessions/{sessionToken}/revoke',
      tags,
    })
    .input(
      z.object({
        id: z.string(),
        sessionToken: z.string(),
      })
    )
    .output(z.void())
    .handler(async ({ context, input }) => {
      if (context.session.token === input.sessionToken) {
        context.logger.warn(
          'Prevent to revoke the current connected user session'
        );
        throw new ORPCError('BAD_REQUEST', {
          message: 'You cannot revoke your current session',
        });
      }

      context.logger.info('Revoke user session');
      const response = await auth.api.revokeUserSession({
        body: {
          sessionToken: input.sessionToken,
        },
        headers: getRequestHeaders(),
      });

      if (!response.success) {
        context.logger.error('Failed to revoke the user session');
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),
};
