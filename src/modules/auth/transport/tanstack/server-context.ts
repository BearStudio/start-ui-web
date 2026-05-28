import {
  getRequestHeaders,
  setResponseHeader,
} from '@tanstack/react-start/server';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';

import type {
  AuthenticatedSession,
  AuthenticatedUser,
  AuthUseCases,
  Permission,
  RequestScope,
} from '@/modules/auth';
import { scopeFromUser } from '@/modules/auth';
import type { UserId } from '@/modules/kernel/domain/ids';
import { logger } from '@/modules/kernel/infrastructure/logger/pino';
import { DEMO_MODE_ERROR, ServerFnError } from '@/modules/kernel/server';
import { timingStore } from '@/modules/kernel/transport/tanstack/timing-store';
import { envClient } from '@/platform/env/client';
import { cachePrivateNoStore } from '@/platform/http/cache-control';
import type { TelemetryAdapter } from '@/platform/telemetry';
import { createNoOpTelemetry } from '@/platform/telemetry';

type ServerTimingEntry = { name: string; durationMs: number };

export type ProcedureLogger = {
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
};

export type ProtectedContext = {
  user: AuthenticatedUser;
  session: AuthenticatedSession;
  scope: RequestScope;
  logger: ProcedureLogger;
};

export type PublicContext = Omit<
  ProtectedContext,
  'user' | 'session' | 'scope'
> & {
  user: AuthenticatedUser | null;
  session: AuthenticatedSession | null;
  scope: RequestScope | null;
};

type ServerContextDeps = {
  getAuthUseCases: () => AuthUseCases;
  telemetry?: TelemetryAdapter;
};

const formatTiming = (entries: ServerTimingEntry[]) =>
  entries.map((e) => `${e.name};dur=${e.durationMs.toFixed(2)}`).join(', ');

const appendServerTiming = (entries: ServerTimingEntry[]) => {
  if (!entries.length) return;
  setResponseHeader('Server-Timing', formatTiming(entries));
};

const setAuthenticatedResponseCacheHeaders = () => {
  setResponseHeader('Cache-Control', cachePrivateNoStore());
  setResponseHeader('Vary', 'Cookie, Authorization');
};

const finalize = (
  procedureLogger: ProcedureLogger,
  timings: ServerTimingEntry[],
  start: number
) => {
  const totalDuration = performance.now() - start;
  procedureLogger.info({ durationMs: totalDuration }, 'After');

  const dbTimings = timingStore.getStore()?.db ?? [];
  const allTimings: ServerTimingEntry[] = [
    ...timings,
    ...dbTimings.map((t) => ({
      name: `db-${t.model}-${t.operation}`,
      durationMs: t.duration,
    })),
    { name: 'global', durationMs: totalDuration },
  ];
  appendServerTiming(allTimings);
};

const handleError = (error: unknown, procedureLogger: ProcedureLogger) => {
  const mappedError = mapTransportError(error);
  const shouldLogOriginalError =
    mappedError instanceof ServerFnError &&
    mappedError.message === 'Unhandled error' &&
    mappedError !== error;

  if (shouldLogOriginalError) {
    procedureLogger.error(error, 'Unhandled error before mapping');
  }

  const logLevel = (() => {
    if (!(mappedError instanceof Error)) return 'error';
    if (
      mappedError instanceof ServerFnError &&
      mappedError.data?.reason === DEMO_MODE_ERROR
    ) {
      return 'info';
    }
    if (mappedError instanceof ServerFnError) {
      if (mappedError.status >= 500) return 'error';
      if (mappedError.status >= 400) return 'warn';
      if (mappedError.status >= 300) return 'info';
    }
    return 'error';
  })();
  procedureLogger[logLevel](mappedError);

  return mappedError;
};

function mapTransportError(error: unknown): unknown {
  if (error instanceof ServerFnError) return error;
  return new ServerFnError('INTERNAL_SERVER_ERROR', {
    message: 'Unhandled error',
  });
}

const assertNotDemoMode = () => {
  if (envClient.VITE_IS_DEMO) {
    throw new ServerFnError('METHOD_NOT_SUPPORTED', {
      message: 'Demo mode prevents mutations',
      data: { reason: DEMO_MODE_ERROR },
    });
  }
};

export const createServerContextTools = ({
  getAuthUseCases,
  telemetry = createNoOpTelemetry(),
}: ServerContextDeps) => {
  const getSession = async (timings: ServerTimingEntry[]) => {
    const authStart = performance.now();
    const session = await getAuthUseCases().getCurrentSession({
      headers: getRequestHeaders(),
    });
    timings.push({ name: 'auth', durationMs: performance.now() - authStart });
    return session;
  };

  const withPublicContext = async <T>(
    fn: (ctx: PublicContext) => Promise<T>
  ): Promise<T> => {
    const start = performance.now();
    const requestId = randomUUID();
    const timings: ServerTimingEntry[] = [];
    let procedureLogger = logger.child({ requestId, scope: 'procedure' });
    procedureLogger.info('Before');

    return await timingStore.run({ db: [] }, async () => {
      try {
        const session = await getSession(timings);
        if (session?.user?.id) {
          setAuthenticatedResponseCacheHeaders();
          telemetry.setUser({
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
            tenantId: null,
          });
          procedureLogger = logger.child({
            requestId,
            userId: session.user.id,
            role: session.user.role,
            scope: 'procedure',
          });
        } else {
          telemetry.setUser(null);
        }

        const ctx: PublicContext = {
          user: session?.user ?? null,
          session: session?.session ?? null,
          scope: session?.user ? scopeFromUser(session.user) : null,
          logger: procedureLogger,
        };
        return await fn(ctx);
      } catch (error) {
        throw handleError(error, procedureLogger);
      } finally {
        finalize(procedureLogger, timings, start);
      }
    });
  };

  const withProtectedContext = async <T>(
    fn: (ctx: ProtectedContext) => Promise<T>
  ): Promise<T> => {
    return withPublicContext(async (ctx) => {
      if (!ctx.user || !ctx.session || !ctx.scope) {
        throw new ServerFnError('UNAUTHORIZED');
      }
      return fn({
        user: ctx.user,
        session: ctx.session,
        scope: ctx.scope,
        logger: ctx.logger,
      });
    });
  };

  const withProtectedMutation = async <T>(
    fn: (ctx: ProtectedContext) => Promise<T>
  ): Promise<T> => {
    return withProtectedContext(async (ctx) => {
      assertNotDemoMode();
      return fn(ctx);
    });
  };

  const assertPermission = async (userId: UserId, permissions: Permission) => {
    const allowed = await getAuthUseCases().checkPermission({
      userId,
      permissions,
      headers: getRequestHeaders(),
    });

    if (!allowed) {
      throw new ServerFnError('FORBIDDEN');
    }
  };

  return {
    assertPermission,
    withProtectedContext,
    withProtectedMutation,
    withPublicContext,
  };
};

export type ServerContextTools = ReturnType<typeof createServerContextTools>;
