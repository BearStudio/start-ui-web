import { accountRouter } from '@/server/api/routers/account';
import { repositoriesRouter } from '@/server/api/routers/repositories';
import { usersRouter } from '@/server/api/routers/users';
import { createTRPCRouter } from '@/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  account: accountRouter,
  repositories: repositoriesRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
