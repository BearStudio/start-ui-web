import { getOpenAPIMeta } from '@orpc/openapi';
import { DEFAULT_ERROR_STATUS, ORPCError, os } from '@orpc/server';
import { type ResponseHeadersHandlerPluginContext } from '@orpc/server/plugins';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { match } from 'ts-pattern';

import { DemoModeError, ERROR_STATUS_MAP } from '@/lib/orpc/errors';

import { envClient } from '@/env/client';
import { Permission } from '@/features/auth/permissions';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { Prisma } from '@/server/db/generated/client';
import { logger } from '@/server/logger';
import { MCP_SCOPES, McpPrincipal } from '@/server/mcp/config';
import { timingStore } from '@/server/timing-store';

// OpenAPI meta method defaults to POST when not set
const getProcedureMethod = (procedure: Parameters<typeof getOpenAPIMeta>[0]) =>
  getOpenAPIMeta(procedure)?.method ?? 'POST';

type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
type AuthUser = NonNullable<AuthSession>['user'];

/** User of an MCP tool call, from the OAuth access token subject */
const getMcpUser = async (mcp: McpPrincipal): Promise<AuthUser | undefined> => {
  const user = await db.user.findUnique({ where: { id: mcp.userId } });
  // Users are onboarded on the consent page (GuardAuthenticated)
  if (!user?.onboardedAt) return undefined;
  const isBanned =
    !!user.banned && (!user.banExpires || user.banExpires > new Date());
  return isBanned ? undefined : { ...user, onboardedAt: user.onboardedAt };
};

const base = os
  .$context<
    ResponseHeadersHandlerPluginContext & {
      /** Set by the MCP server (/api/mcp) instead of a session cookie */
      mcp?: McpPrincipal;
    }
  >()
  .errors({ [DemoModeError.code]: DemoModeError })
  // Auth
  .use(async ({ next, context }) => {
    const start = performance.now();

    const session = context.mcp
      ? undefined
      : await auth.api.getSession({ headers: getRequestHeaders() });
    const user = context.mcp ? await getMcpUser(context.mcp) : session?.user;

    const duration = performance.now() - start;

    context.resHeaders?.append(
      'Server-Timing',
      `auth;dur=${duration.toFixed(2)}`
    );

    return await next({
      context: {
        user,
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
      type: getProcedureMethod(procedure),
      requestId: randomUUID(),
      userId: context.user?.id,
      mcpClientId: context.mcp?.clientId,
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
        if (error instanceof DemoModeError) return 'info';
        if (!(error instanceof ORPCError)) return 'error';
        const status = ERROR_STATUS_MAP[error.code] ?? DEFAULT_ERROR_STATUS;
        if (status >= 500) return 'error';
        if (status >= 400) return 'warn';
        if (status >= 300) return 'info';
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
  .use(async ({ next, procedure, errors }) => {
    if (envClient.VITE_IS_DEMO && getProcedureMethod(procedure) !== 'GET') {
      throw errors.DEMO_MODE_ENABLED();
    }
    return await next();
  })
  // Prisma Error Handler
  .use(async ({ next, context }) => {
    try {
      return await next();
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw match(error.code)
          .with('P2002', () => {
            context.logger.warn(
              error.meta,
              `Prisma Error: ${error.code} ${error.message}`
            );
            return new ORPCError('CONFLICT', {
              message: 'Unique constraint violation',
              data: { target: error.meta?.target },
            });
          })
          .with('P2025', () => {
            context.logger.warn(
              error.meta,
              `Prisma Error ${error.code}: ${error.message}`
            );
            return new ORPCError('NOT_FOUND', {
              message: 'Record not found',
            });
          })
          .with('P2003', () => {
            context.logger.error(
              error.meta,
              `Prisma Error ${error.code}: ${error.message}`
            );
            return new ORPCError('BAD_REQUEST', {
              message: 'Foreign key constraint violation',
            });
          })
          .otherwise(() => {
            context.logger.error(
              error.meta,
              `Prisma Error ${error.code}: ${error.message}`
            );
            return new ORPCError('INTERNAL_SERVER_ERROR', {
              message: 'Database error',
            });
          });
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        context.logger.error(
          `Prisma Client Validation Error: ${error.message}`
        );
        throw new ORPCError('BAD_REQUEST', {
          message: 'Database validation error',
        });
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Unhandled error',
      });
    }
  });

export const publicProcedure = () => base;

export const protectedProcedure = ({
  permissions,
}: {
  permissions: Permission | null;
}) =>
  base.use(async ({ context, next, procedure }) => {
    const { user, session, mcp } = context;

    // Web: session cookie, MCP: OAuth access token (no session)
    if (!user || (!session && !mcp)) {
      throw new ORPCError('UNAUTHORIZED');
    }

    // The OAuth scopes granted to the MCP client limit what it can do on
    // top of the user permissions
    if (mcp) {
      const requiredScope =
        getProcedureMethod(procedure) === 'GET'
          ? MCP_SCOPES.read
          : MCP_SCOPES.write;
      if (!mcp.scopes.includes(requiredScope)) {
        throw new ORPCError('FORBIDDEN', {
          message: `The "${requiredScope}" scope is required`,
        });
      }
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
      // MCP requests carry a bearer token, not a session: check the user by id
      headers: mcp ? undefined : getRequestHeaders(),
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
