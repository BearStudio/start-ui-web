import {
  getRequestHeaders,
  setResponseHeader,
} from '@tanstack/react-start/server';
import { Result } from '@swan-io/boxed';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { match, P } from 'ts-pattern';

import type {
  AuthenticatedSession,
  AuthenticatedUser,
  AuthUseCases,
  Permission,
  RequestScope,
} from '@/modules/auth';
import { scopeFromUser, scopeKeyFromScope } from '@/modules/auth';
import {
  createRequestLogger,
  type Logger,
  type LogLevel,
} from '@/modules/kernel';
import type { UserId } from '@/modules/kernel/domain/ids';
import { toRequestId } from '@/modules/kernel/domain/ids';
import { DEMO_MODE_ERROR, ServerFnError } from '@/modules/kernel/client';
import { timingStore } from '@/modules/kernel/transport/tanstack/timing-store';
import { envClient } from '@/platform/env/client';
import { cachePrivateNoStore } from '@/platform/http/cache-control';
import type { TelemetryAdapter } from '@/platform/telemetry';
import { createNoOpTelemetry } from '@/platform/telemetry';

type ServerTimingEntry = { name: string; durationMs: number };

export type ProcedureLogger = Logger;

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
  logger?: Logger;
  telemetry?: TelemetryAdapter;
};

const noOpLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
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
  procedureLogger.info({
    event: 'server_fn.request.finish',
    direction: 'inbound',
    durationMs: totalDuration,
  });

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
    procedureLogger.error({
      event: 'server_fn.error.unhandled',
      direction: 'inbound',
      error:
        error instanceof Error
          ? error.message
          : 'Unhandled error before mapping',
      exception: error,
    });
  }

  const logLevel: LogLevel = (() => {
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
  if (
    mappedError instanceof ServerFnError &&
    (mappedError.code === 'UNAUTHORIZED' || mappedError.code === 'FORBIDDEN')
  ) {
    procedureLogger.warn({
      event: 'security.authz_denied',
      direction: 'inbound',
      details: {
        code: mappedError.code,
        status: mappedError.status,
      },
    });
  }
  procedureLogger[logLevel]({
    event: 'server_fn.error.mapped',
    direction: 'inbound',
    error: mappedError instanceof Error ? mappedError.message : 'Unknown error',
    details:
      mappedError instanceof ServerFnError
        ? {
            code: mappedError.code,
            data: mappedError.data,
            status: mappedError.status,
          }
        : { value: mappedError },
  });

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
  logger = noOpLogger,
  telemetry = createNoOpTelemetry(),
}: ServerContextDeps) => {
  const getSession = async (timings: ServerTimingEntry[]) => {
    const authStart = performance.now();
    const result = await getAuthUseCases().getCurrentSession({
      headers: getRequestHeaders(),
    });
    timings.push({ name: 'auth', durationMs: performance.now() - authStart });
    return match(result)
      .with(Result.P.Error(P.select()), (error) => {
        throw error;
      })
      .with(
        Result.P.Ok({ type: 'auth_session_found', session: P.select() }),
        (session) => session
      )
      .with(Result.P.Ok({ type: 'auth_session_missing' }), () => null)
      .exhaustive();
  };

  const withPublicContext = async <T>(
    fn: (ctx: PublicContext) => Promise<T>
  ): Promise<T> => {
    const start = performance.now();
    const requestId = toRequestId(randomUUID());
    const timings: ServerTimingEntry[] = [];
    let procedureLogger = createRequestLogger({ logger, requestId });
    procedureLogger.info({
      event: 'server_fn.request.start',
      direction: 'inbound',
    });

    return await timingStore.run({ db: [] }, async () => {
      try {
        const session = await getSession(timings);
        if (session?.user?.id) {
          setAuthenticatedResponseCacheHeaders();
          telemetry.setUser({
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
          });
          const scope = scopeFromUser(session.user);
          procedureLogger = createRequestLogger({
            logger,
            requestId,
            userId: session.user.id,
            sessionId: session.session.id,
            scopeKey: scopeKeyFromScope(scope),
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
    const result = await getAuthUseCases().checkPermission({
      userId,
      permissions,
      headers: getRequestHeaders(),
    });
    return match(result)
      .with(Result.P.Error(P.select()), (error) => {
        throw error;
      })
      .with(Result.P.Ok({ type: 'auth_permission_granted' }), () => undefined)
      .with(Result.P.Ok(P.select()), () => {
        throw new ServerFnError('FORBIDDEN');
      })
      .exhaustive();
  };

  return {
    assertPermission,
    withProtectedContext,
    withProtectedMutation,
    withPublicContext,
  };
};

export type ServerContextTools = ReturnType<typeof createServerContextTools>;
