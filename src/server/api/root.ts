import { z } from 'zod';

import { accountRouter } from '@/server/api/routers/account';
import { authRouter } from '@/server/api/routers/auth';
import { repositoriesRouter } from '@/server/api/routers/repositories';
import { usersRouter } from '@/server/api/routers/users';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  account: accountRouter,
  repositories: repositoriesRouter,
  users: usersRouter,
  check: publicProcedure
    .meta({ openapi: { method: 'GET', path: '/check' } })
    .input(z.object({ name: z.string() }))
    .output(z.string())
    .query(({ input }) => {
      return `Hello ${input.name ?? 'world'}`;
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
