import { onError, ORPCError, os } from '@orpc/server';
import { randomUUID } from 'node:crypto';

import { db } from '@/server/config/db';
import { logger } from '@/server/config/logger';
import { getCurrentSession } from '@/server/config/session';

const authMiddleware = os.middleware(async ({ next }) => {
  const { session, user } = await getCurrentSession();

  return await next({
    context: {
      user,
      session,
      db,
    },
  });
});

const loggerMiddleware = os.middleware(
  async ({ next, context, procedure, path }) => {
    const start = Date.now();
    const meta = {
      path: path.join('.'),
      type: procedure['~orpc'].route.method, // TODO This looks internal,
      requestId: randomUUID(),
      userId: context.user?.id,
    };

    const loggerForMiddleWare = logger.child({ ...meta, scope: 'procedure' });

    loggerForMiddleWare.info('Before');

    const result = await next({
      context: { logger: loggerForMiddleWare },
    });

    loggerForMiddleWare.info({ durationMs: Date.now() - start }, 'After');

    // TODO how to handle errors: onError helper or by hand?
    // TODO can we use the powerful helper to better manage logs? https://orpc.unnoq.com/docs/middleware#built-in-middlewares

    return result;
  }
);

export const publicProcedure = os.use(authMiddleware).use(loggerMiddleware);

export const protectedProcedure = publicProcedure.use(
  async ({ context, next }) => {
    const { session, user } = context;

    if (!session || !user) {
      throw new ORPCError('UNAUTHORIZED');
    }

    return await next({
      context: {
        user,
        session,
      },
    });
  }
);
