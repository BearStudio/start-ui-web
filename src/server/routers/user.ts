import { ORPCError } from '@orpc/client';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { and, asc, desc, eq, gt, ilike, lt, or, sql } from 'drizzle-orm';
import { z } from 'zod';

import { zSession, zUser } from '@/features/user/schema';
import { auth } from '@/server/auth';
import { session, user } from '@/server/db/schema';
import { protectedProcedure } from '@/server/orpc';

const tags = ['users'];

export default {
  getAll: protectedProcedure({
    permissions: {
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
          limit: z.coerce.number().int().min(1).max(100).prefault(20),
          searchTerm: z.string().trim().optional().prefault(''),
        })
        .prefault({})
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

      const searchPattern = `%${input.searchTerm}%`;
      const searchFilter = input.searchTerm
        ? or(ilike(user.name, searchPattern), ilike(user.email, searchPattern))
        : undefined;

      const cursorRow = input.cursor
        ? await context.db.query.user.findFirst({
            where: eq(user.id, input.cursor),
            columns: { id: true, name: true },
          })
        : undefined;

      if (input.cursor && !cursorRow) {
        const [totalResult] = await context.db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(user)
          .where(searchFilter);

        return {
          items: [],
          nextCursor: undefined,
          total: totalResult?.count ?? 0,
        };
      }

      const cursorFilter = cursorRow
        ? or(
            gt(user.name, cursorRow.name),
            and(eq(user.name, cursorRow.name), gt(user.id, cursorRow.id))
          )
        : undefined;

      const where = and(searchFilter, cursorFilter);

      const [totalResult, items] = await Promise.all([
        context.db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(user)
          .where(searchFilter),
        context.db.query.user.findMany({
          where: where,
          orderBy: [asc(user.name), asc(user.id)],
          limit: input.limit + 1,
        }),
      ]);

      const total = totalResult[0]?.count ?? 0;

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
    permissions: {
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
      const result = await context.db.query.user.findFirst({
        where: eq(user.id, input.id),
      });

      if (!result) {
        context.logger.warn('Unable to find user with the provided input');
        throw new ORPCError('NOT_FOUND');
      }

      return result;
    }),

  updateById: protectedProcedure({
    permissions: {
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
        where: eq(user.id, input.id),
        columns: { email: true },
      });

      if (!currentUser) {
        context.logger.warn('Unable to find user with the provided input');
        throw new ORPCError('NOT_FOUND');
      }

      context.logger.info('Update user');
      const [updated] = await context.db
        .update(user)
        .set({
          name: input.name ?? '',
          // Prevent to change role of the connected user
          role:
            context.user.id === input.id
              ? undefined
              : (input.role ?? undefined),
          email: input.email,
          // Set email as verified if admin changed the email
          emailVerified: currentUser.email !== input.email ? true : undefined,
        })
        .where(eq(user.id, input.id))
        .returning();

      if (!updated) {
        throw new ORPCError('NOT_FOUND');
      }

      return updated;
    }),

  create: protectedProcedure({
    permissions: {
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
      const [created] = await context.db
        .insert(user)
        .values({
          email: input.email,
          emailVerified: true,
          name: input.name ?? '',
          role: input.role ?? 'user',
        })
        .returning();

      if (!created) {
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }

      return created;
    }),

  deleteById: protectedProcedure({
    permissions: {
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
    permissions: {
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
        limit: z.coerce.number().int().min(1).max(100).prefault(20),
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

      const userIdFilter = eq(session.userId, input.userId);

      const cursorRow = input.cursor
        ? await context.db.query.session.findFirst({
            where: eq(session.id, input.cursor),
            columns: { id: true, createdAt: true },
          })
        : undefined;

      if (input.cursor && !cursorRow) {
        const [totalResult] = await context.db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(session)
          .where(userIdFilter);

        return {
          items: [],
          nextCursor: undefined,
          total: totalResult?.count ?? 0,
        };
      }

      const cursorFilter = cursorRow
        ? or(
            and(
              eq(session.createdAt, cursorRow.createdAt),
              gt(session.id, cursorRow.id)
            ),
            lt(session.createdAt, cursorRow.createdAt)
          )
        : undefined;

      const where = and(userIdFilter, cursorFilter);

      const [totalResult, items] = await Promise.all([
        context.db
          .select({ count: sql<number>`cast(count(*) as integer)` })
          .from(session)
          .where(userIdFilter),
        context.db.query.session.findMany({
          where: where,
          orderBy: [desc(session.createdAt), asc(session.id)],
          limit: input.limit + 1,
        }),
      ]);

      const total = totalResult[0]?.count ?? 0;

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
    permissions: {
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
    permissions: {
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
