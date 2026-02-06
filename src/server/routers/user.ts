import { ORPCError } from '@orpc/client';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { z } from 'zod';

import { zSession, zUser } from '@/features/user/schema';
import { auth } from '@/server/auth';
import { Prisma } from '@/server/db/generated/client';
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

      context.logger.info('Getting users from database');
      const [total, items] = await Promise.all([
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
      const currentUser = await context.db.user.findUnique({
        where: { id: input.id },
        select: { email: true },
      });

      if (!currentUser) {
        context.logger.warn('Unable to find user with the provided input');
        throw new ORPCError('NOT_FOUND');
      }

      context.logger.info('Update user');
      return await context.db.user.update({
        where: { id: input.id },
        data: {
          name: input.name ?? '',
          // Prevent to change role of the connected user
          role: context.user.id === input.id ? undefined : input.role,
          email: input.email,
          // Set email as verified if admin changed the email
          emailVerified: currentUser.email !== input.email ? true : undefined,
        },
      });
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
      return await context.db.user.create({
        data: {
          email: input.email,
          emailVerified: true,
          name: input.name ?? '',
          role: input.role ?? 'user',
        },
      });
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
      const where = {
        userId: input.userId,
      } satisfies Prisma.SessionWhereInput;

      context.logger.info('Getting user sessions from database');
      const [total, items] = await Promise.all([
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
