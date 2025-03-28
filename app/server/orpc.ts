import { ORPCError, os } from '@orpc/server';
import { type ResponseHeadersPluginContext } from '@orpc/server/plugins';
import { randomUUID } from 'node:crypto';

import { Permission } from '@/lib/auth/client';

import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { logger } from '@/server/logger';
import { getHeaders } from '@/server/utils';

const base = os
  .$context<ResponseHeadersPluginContext>()
  // Auth
  .use(async ({ next }) => {
    const session = await auth.api.getSession({ headers: getHeaders() });

    return await next({
      context: {
        user: session?.user,
        db,
      },
    });
  })
  // Logger
  .use(async ({ next, context, procedure, path }) => {
    const start = Date.now();
    const meta = {
      path: path.join('.'),
      type: procedure['~orpc'].route.method,
      requestId: randomUUID(),
      userId: context.user?.id,
    };

    const loggerForMiddleWare = logger.child({ ...meta, scope: 'procedure' });

    loggerForMiddleWare.info('Before');

    try {
      const result = await next({
        context: { logger: loggerForMiddleWare },
      });

      loggerForMiddleWare.info({ durationMs: Date.now() - start }, 'After');

      return result;
    } catch (error) {
      loggerForMiddleWare.error(error);

      throw error;
    }
  });

export const publicProcedure = () => base;

export const protectedProcedure = ({
  permission,
}: {
  permission: Permission | null;
}) =>
  base.use(async ({ context, next }) => {
    const { user } = context;

    if (!user) {
      throw new ORPCError('UNAUTHORIZED');
    }

    if (!permission) {
      return await next({
        context: {
          user,
        },
      });
    }

    const userHasPermission = await auth.api.userHasPermission({
      body: {
        userId: user.id,
        permission,
      },
    });

    if (userHasPermission.error) {
      throw new ORPCError('INTERNAL_SERVER_ERROR');
    }

    if (!userHasPermission.success) {
      throw new ORPCError('FORBIDDEN');
    }

    return await next({
      context: {
        user,
      },
    });
  });
