import {
  getRequestHeaders,
  setResponseHeader,
} from '@tanstack/react-start/server';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { match } from 'ts-pattern';

import { envClient } from '@/env/client';
import { Permission } from '@/features/auth/permissions';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { logger } from '@/server/logger';
import { ServerFnError } from '@/server/server-fn-error';
import { timingStore } from '@/server/timing-store.server';

type ServerTimingEntry = { name: string; durationMs: number };

export type ProcedureLogger = {
  warn: (...args: ExplicitAny[]) => void;
  error: (...args: ExplicitAny[]) => void;
  info: (...args: ExplicitAny[]) => void;
};

type PgError = Error & {
  code: string;
  constraint?: string;
  file?: string;
  line?: string;
  routine?: string;
  severity: string;
};

type PgErrorCandidate = Error & {
  code?: unknown;
  file?: unknown;
  line?: unknown;
  routine?: unknown;
  severity?: unknown;
};

const uniqueConstraintTargets: Record<string, string[]> = {
  account_provider_account_key: ['providerId', 'accountId'],
  book_title_author_key: ['title', 'author'],
  genre_name_key: ['name'],
  session_token_key: ['token'],
  user_email_key: ['email'],
  verification_identifier_value_key: ['identifier', 'value'],
};

const isPgError = (error: unknown): error is PgError => {
  if (!(error instanceof Error)) return false;

  const candidate = error as PgErrorCandidate;
  const hasPgSource =
    typeof candidate.file === 'string' ||
    typeof candidate.line === 'string' ||
    typeof candidate.routine === 'string';

  return (
    typeof candidate.code === 'string' &&
    /^[A-Z0-9]{5}$/.test(candidate.code) &&
    typeof candidate.severity === 'string' &&
    hasPgSource
  );
};

export type AuthenticatedUser = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>['user'];

export type AuthenticatedSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>['session'];

export type ProtectedContext = {
  user: AuthenticatedUser;
  session: AuthenticatedSession;
  db: typeof db;
  logger: ProcedureLogger;
};

export type PublicContext = Omit<ProtectedContext, 'user' | 'session'> & {
  user: AuthenticatedUser | null;
  session: AuthenticatedSession | null;
};

const formatTiming = (entries: ServerTimingEntry[]) =>
  entries.map((e) => `${e.name};dur=${e.durationMs.toFixed(2)}`).join(', ');

const appendServerTiming = (entries: ServerTimingEntry[]) => {
  if (!entries.length) return;
  setResponseHeader('Server-Timing', formatTiming(entries));
};

const getSession = async (timings: ServerTimingEntry[]) => {
  const authStart = performance.now();
  const session = await auth.api.getSession({
    headers: getRequestHeaders(),
  });
  timings.push({ name: 'auth', durationMs: performance.now() - authStart });
  return session;
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
  const mappedError = mapDbError(error);
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

function mapDbError(error: unknown): unknown {
  if (error instanceof ServerFnError) return error;

  if (isPgError(error)) {
    return match(error.code)
      .with('23505', () => {
        const target = getUniqueConstraintTarget(error);
        return new ServerFnError('CONFLICT', {
          message: 'Unique constraint violation',
          data: { target },
        });
      })
      .with('23503', () => {
        return new ServerFnError('BAD_REQUEST', {
          message: 'Foreign key constraint violation',
        });
      })
      .otherwise(() => {
        return new ServerFnError('INTERNAL_SERVER_ERROR', {
          message: 'Database error',
        });
      });
  }

  return new ServerFnError('INTERNAL_SERVER_ERROR', {
    message: 'Unhandled error',
  });
}

function getUniqueConstraintTarget(error: PgError): string[] | undefined {
  if (!error.constraint) return undefined;
  return uniqueConstraintTargets[error.constraint];
}

const assertNotDemoMode = () => {
  if (envClient.VITE_IS_DEMO) {
    throw new ServerFnError('METHOD_NOT_SUPPORTED', {
      message: 'DEMO_MODE_ENABLED',
    });
  }
};

export async function withPublicContext<T>(
  fn: (ctx: PublicContext) => Promise<T>
): Promise<T> {
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
        db,
        logger: procedureLogger,
      };
      return await fn(ctx);
    } catch (error) {
      throw handleError(error, procedureLogger);
    } finally {
      finalize(procedureLogger, timings, start);
    }
  });
}

export async function withProtectedContext<T>(
  fn: (ctx: ProtectedContext) => Promise<T>
): Promise<T> {
  return withPublicContext(async (ctx) => {
    if (!ctx.user || !ctx.session) {
      throw new ServerFnError('UNAUTHORIZED');
    }
    return fn({
      user: ctx.user,
      session: ctx.session,
      db: ctx.db,
      logger: ctx.logger,
    });
  });
}

export async function withProtectedMutation<T>(
  fn: (ctx: ProtectedContext) => Promise<T>
): Promise<T> {
  return withProtectedContext(async (ctx) => {
    assertNotDemoMode();
    return fn(ctx);
  });
}

export async function assertPermission(
  userId: string,
  permissions: Permission
) {
  const result = await auth.api.userHasPermission({
    body: { userId, permissions },
  });

  if (result.error) {
    throw new ServerFnError('INTERNAL_SERVER_ERROR');
  }

  if (!result.success) {
    throw new ServerFnError('FORBIDDEN');
  }
}

export { isPgError };
export type { PgError };
