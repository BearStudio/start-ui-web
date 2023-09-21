/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { OpenApiMeta } from 'trpc-openapi';
import { ZodError } from 'zod';

import { getServerAuthSession } from '@/server/auth';
import { db } from '@/server/db';

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async () => {
  // Get the session from the server using the getServerSession wrapper function
  const user = await getServerAuthSession();

  return {
    user,
    db,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createTRPCContext>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
  });

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.user.activated || !ctx.user.emailVerified) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'coucou' + ctx.user?.email,
    });
  }
  return next({
    ctx: {
      // infers the `user` as non-nullable
      user: ctx.user,
    },
  });
});

/** Reusable middleware that enforces users are admin before running the procedure. */
const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (ctx.user?.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({
    ctx: {
      // infers the `user` as non-nullable
      user: ctx.user,
    },
  });
});

/** Demo Middleware */
const enforceDemo = t.middleware(({ ctx, next, type, path }) => {
  if (process.env.NEXT_PUBLIC_IS_DEMO !== 'true') {
    return next({
      ctx,
    });
  }

  if (type !== 'mutation' || path === 'auth.login' || path === 'auth.logout') {
    return next({
      ctx,
    });
  }

  throw new TRPCError({
    code: 'FORBIDDEN',
    message: '[DEMO] You cannot run mutation in Demo mode',
  });
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(enforceDemo);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(enforceDemo)
  .use(enforceUserIsAuthed);

/**
 * Admin protected procedure
 *
 * If you want a query or mutation to ONLY be accessible to admin users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user.role` is `ADMIN`.
 *
 * @see https://trpc.io/docs/procedures
 */
export const adminProcedure = t.procedure
  .use(enforceDemo)
  .use(enforceUserIsAuthed)
  .use(enforceUserIsAdmin);