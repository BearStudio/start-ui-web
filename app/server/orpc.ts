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
