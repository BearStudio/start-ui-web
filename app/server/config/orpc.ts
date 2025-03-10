import { ORPCError, os } from '@orpc/server';

import { logger } from '@/server/config/logger';
import { getCurrentSession } from '@/server/config/session';

const authMiddleware = os.middleware(async ({ next }) => {
  const { session, user } = await getCurrentSession();

  return await next({
    context: {
      user,
      session,
      logger,
    },
  });
});

export const publicProcedure = os.use(authMiddleware);

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
