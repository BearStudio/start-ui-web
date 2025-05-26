import { ORPCError, os } from '@orpc/server';
import { type ResponseHeadersPluginContext } from '@orpc/server/plugins';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';

import { envClient } from '@/env/client';
import { Permission } from '@/features/auth/permissions';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { logger } from '@/server/logger';
import { timingStore } from '@/server/timing-store';
import { getHeaders } from '@/server/utils';

const base = os
  .$context<ResponseHeadersPluginContext>()
  // Auth
  .use(async ({ next, context }) => {
    const start = performance.now();

    const session = await auth.api.getSession({ headers: getHeaders() });

    const duration = performance.now() - start;

    context.resHeaders?.append(
      'Server-Timing',
      `auth;dur=${duration.toFixed(2)}`
    );

    return await next({
      context: {
        user: session?.user,
        session: session?.session,
        db,
      },
    });
  })

  // Logger
  .use(async ({ next, context, procedure, path }) => {
    const start = performance.now();
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

      const duration = performance.now() - start;
      loggerForMiddleWare.info({ durationMs: duration }, 'After');
      context.resHeaders?.append(
        'Server-Timing',
        `global;dur=${duration.toFixed(2)}`
      );

      return result;
    } catch (error) {
      const logLevel = (() => {
        if (!(error instanceof ORPCError)) return 'error';
        if (error.message === 'DEMO_MODE_ENABLED') return 'info';
        const errorCode = error.status;
        if (errorCode >= 500) return 'error';
        if (errorCode >= 400) return 'warn';
        if (errorCode >= 300) return 'info';
        return 'error';
      })();

      loggerForMiddleWare[logLevel](error);
      throw error;
    }
  })
  // Middleware to add database Server Timing header
  .use(async ({ next, context }) => {
    return timingStore.run({ prisma: [] }, async () => {
      const result = await next();

      // Add the Server-Timing header if there are timings
      const serverTimingHeader = timingStore
        .getStore()
        ?.prisma.map(
          (timing) =>
            `db-${timing.model}-${timing.operation};dur=${timing.duration.toFixed(2)}`
        )
        .join(', ');

      if (serverTimingHeader) {
        context.resHeaders?.append('Server-Timing', serverTimingHeader);
      }

      return result;
    });
  })
  // Demo Mode
  .use(async ({ next, procedure }) => {
    if (envClient.VITE_IS_DEMO && procedure['~orpc'].route.method !== 'GET') {
      throw new ORPCError('METHOD_NOT_SUPPORTED', {
        message: 'DEMO_MODE_ENABLED',
      });
    }
    return await next();
  });

export const publicProcedure = () => base;

export const protectedProcedure = ({
  permission,
}: {
  permission: Permission | null;
}) =>
  base.use(async ({ context, next }) => {
    const { user, session } = context;

    if (!user || !session) {
      throw new ORPCError('UNAUTHORIZED');
    }

    if (!permission) {
      return await next({
        context: {
          user,
          session,
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
        session,
      },
    });
  });
