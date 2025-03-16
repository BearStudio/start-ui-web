import { ORPCError, os } from '@orpc/server';
import { randomUUID } from 'node:crypto';
import { getHeaders } from 'vinxi/http';

import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { logger } from '@/server/logger';

const base = os
  .$context<Record<never, never>>()
  // Auth
  .use(async ({ next }) => {
    const session = await auth.api.getSession({
      headers: (await getHeaders()) as unknown as TODO, // TODO Update the types here
    });

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

export const publicProcedure = base;

export const protectedProcedure = base.use(async ({ context, next }) => {
  const { user } = context;

  if (!user) {
    throw new ORPCError('UNAUTHORIZED');
  }

  return await next({
    context: {
      user,
    },
  });
});
