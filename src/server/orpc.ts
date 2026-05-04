import { ORPCError, os } from '@orpc/server';
import { type ResponseHeadersPluginContext } from '@orpc/server/plugins';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { match } from 'ts-pattern';

import { envClient } from '@/env/client';
import { Permission } from '@/features/auth/permissions';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { logger } from '@/server/logger';
import { timingStore } from '@/server/timing-store';

type PgError = Error & { code: string; constraint?: string };

const uniqueConstraintTargets: Record<string, string[]> = {
  account_provider_account_key: ['providerId', 'accountId'],
  book_title_author_key: ['title', 'author'],
  genre_name_key: ['name'],
  session_token_key: ['token'],
  user_email_key: ['email'],
  verification_identifier_value_key: ['identifier', 'value'],
};

const isPgError = (error: unknown): error is PgError => {
  const code =
    error instanceof Error ? (error as { code?: unknown }).code : undefined;
  return typeof code === 'string' && /^[A-Z0-9]{5}$/.test(code);
};

const base = os
  .$context<ResponseHeadersPluginContext>()
  // Auth
  .use(async ({ next, context }) => {
    const start = performance.now();

    const session = await auth.api.getSession({ headers: getRequestHeaders() });

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
    return timingStore.run({ db: [] }, async () => {
      const result = await next();

      // Add the Server-Timing header if there are timings
      const serverTimingHeader = timingStore
        .getStore()
        ?.db.map(
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
  })
  // Database Error Handler
  .use(async ({ next, context }) => {
    try {
      return await next();
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }

      if (isPgError(error)) {
        throw match(error.code)
          .with('23505', () => {
            const target = getUniqueConstraintTarget(error);
            context.logger.warn(
              { constraint: error.constraint },
              `DB Error: ${error.code} ${error.message}`
            );
            return new ORPCError('CONFLICT', {
              message: 'Unique constraint violation',
              data: { target },
            });
          })
          .with('23503', () => {
            context.logger.error(
              { constraint: error.constraint },
              `DB Error ${error.code}: ${error.message}`
            );
            return new ORPCError('BAD_REQUEST', {
              message: 'Foreign key constraint violation',
            });
          })
          .otherwise(() => {
            context.logger.error(
              { constraint: error.constraint },
              `DB Error ${error.code}: ${error.message}`
            );
            return new ORPCError('INTERNAL_SERVER_ERROR', {
              message: 'Database error',
            });
          });
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Unhandled error',
      });
    }
  });

function getUniqueConstraintTarget(error: PgError): string[] | undefined {
  if (!error.constraint) return undefined;
  return uniqueConstraintTargets[error.constraint];
}

export const publicProcedure = () => base;

export const protectedProcedure = ({
  permissions,
}: {
  permissions: Permission | null;
}) =>
  base.use(async ({ context, next }) => {
    const { user, session } = context;

    if (!user || !session) {
      throw new ORPCError('UNAUTHORIZED');
    }

    if (!permissions) {
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
        permissions,
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

export { isPgError };
export type { PgError };
