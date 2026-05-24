import {
  getRequestHeaders,
  setResponseHeader,
} from '@tanstack/react-start/server';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';

import type {
  AuthenticatedSession,
  AuthenticatedUser,
  AuthGateway,
  Permission,
} from '@/modules/auth';
import { logger } from '@/modules/kernel/infrastructure/logger/pino';
import { ServerFnError } from '@/modules/kernel/server';
import { timingStore } from '@/modules/kernel/transport/tanstack/timing-store';
import { envClient } from '@/platform/env/client';

type ServerTimingEntry = { name: string; durationMs: number };

export type ProcedureLogger = {
  warn: (...args: ExplicitAny[]) => void;
  error: (...args: ExplicitAny[]) => void;
  info: (...args: ExplicitAny[]) => void;
};

export type ProtectedContext = {
  user: AuthenticatedUser;
  session: AuthenticatedSession;
  logger: ProcedureLogger;
};

export type PublicContext = Omit<ProtectedContext, 'user' | 'session'> & {
  user: AuthenticatedUser | null;
  session: AuthenticatedSession | null;
};

type ServerContextDeps = {
  getAuthGateway: () => AuthGateway;
};

const formatTiming = (entries: ServerTimingEntry[]) =>
  entries.map((e) => `${e.name};dur=${e.durationMs.toFixed(2)}`).join(', ');

const appendServerTiming = (entries: ServerTimingEntry[]) => {
  if (!entries.length) return;
  setResponseHeader('Server-Timing', formatTiming(entries));
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
    if (mappedError.message === 'DEMO_MODE_ENABLED') return 'info';
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
      message: 'DEMO_MODE_ENABLED',
    });
  }
};

export const createServerContextTools = ({
  getAuthGateway,
}: ServerContextDeps) => {
  const getSession = async (timings: ServerTimingEntry[]) => {
    const authStart = performance.now();
    const session = await getAuthGateway().getSession({
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
          procedureLogger = logger.child({
            requestId,
            userId: session.user.id,
            scope: 'procedure',
          });
        }

        const ctx: PublicContext = {
          user: session?.user ?? null,
          session: session?.session ?? null,
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
      if (!ctx.user || !ctx.session) {
        throw new ServerFnError('UNAUTHORIZED');
      }
      return fn({
        user: ctx.user,
        session: ctx.session,
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

  const assertPermission = async (userId: string, permissions: Permission) => {
    const allowed = await getAuthGateway().userHasPermission({
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
