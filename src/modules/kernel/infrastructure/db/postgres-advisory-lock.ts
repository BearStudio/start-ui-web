import type { PoolClient } from 'pg';
import { Pool } from 'pg';

import { ConfigurationError } from '@/modules/kernel/domain/errors/configuration-error';
import {
  getDatabaseConfig,
  isLikelyTransactionPooledDatabaseUrl,
} from '@/modules/kernel/infrastructure/config/database';

export interface PostgresAdvisoryLockLease {
  release: () => Promise<void>;
  onLost?: (handler: (error: unknown) => void) => () => void;
}

const LOCK_SESSION_IDLE_TIMEOUT = '30s';
const LOCK_SESSION_HEARTBEAT_INTERVAL_MS = 10_000;

function assertAdvisoryLockSupported(): { url: string } {
  const config = getDatabaseConfig();
  if (config.driver === 'neon-http') {
    throw new ConfigurationError(
      'Postgres advisory locks require a session-sticky database driver.'
    );
  }

  if (isLikelyTransactionPooledDatabaseUrl(config.databaseUrl)) {
    throw new ConfigurationError(
      'Postgres advisory locks require a direct or session-sticky database URL.'
    );
  }

  return { url: config.databaseUrl };
}

async function closeLockSession(params: {
  client: PoolClient | undefined;
  force?: boolean;
  pool: Pool;
  sessionClosed: boolean;
  setSessionClosed: () => void;
}) {
  if (params.sessionClosed) return;
  params.setSessionClosed();

  try {
    params.client?.release(params.force ? true : undefined);
  } finally {
    await params.pool.end();
  }
}

function createLockSessionHeartbeat(
  client: PoolClient,
  closeSession: (options?: { force?: boolean }) => Promise<void>
): PostgresAdvisoryLockLease {
  let stopped = false;
  let scheduledHeartbeat: ReturnType<typeof setTimeout> | undefined;
  let heartbeatFailure: unknown;
  let inFlightHeartbeat: Promise<void> = Promise.resolve();
  const lossListeners = new Set<(error: unknown) => void>();

  const notifyLossListener = (
    listener: (error: unknown) => void,
    error: unknown
  ): void => {
    try {
      listener(error);
    } catch {
      // Preserve the original heartbeat failure even if a callback misbehaves.
    }
  };

  const notifyHeartbeatLoss = (error: unknown): void => {
    if (heartbeatFailure !== undefined) return;

    heartbeatFailure = error;
    for (const listener of lossListeners) {
      notifyLossListener(listener, error);
    }
    closeSession({ force: true }).catch(() => undefined);
  };

  const scheduleNextHeartbeat = (): void => {
    if (stopped) return;

    scheduledHeartbeat = setTimeout(() => {
      inFlightHeartbeat = client
        .query('SELECT 1')
        .then((): void => undefined)
        .catch((error: unknown) => {
          notifyHeartbeatLoss(error);
        })
        .finally(() => {
          if (!stopped && heartbeatFailure === undefined) {
            scheduleNextHeartbeat();
          }
        });
    }, LOCK_SESSION_HEARTBEAT_INTERVAL_MS);
    scheduledHeartbeat.unref?.();
  };

  scheduleNextHeartbeat();

  return {
    onLost: (handler: (error: unknown) => void): (() => void) => {
      if (heartbeatFailure !== undefined) {
        notifyLossListener(handler, heartbeatFailure);
        return (): void => undefined;
      }

      lossListeners.add(handler);
      return (): void => {
        lossListeners.delete(handler);
      };
    },
    release: async (): Promise<void> => {
      stopped = true;
      if (scheduledHeartbeat) clearTimeout(scheduledHeartbeat);
      lossListeners.clear();

      await inFlightHeartbeat;
      if (heartbeatFailure !== undefined) throw heartbeatFailure;
    },
  };
}

export async function tryAcquirePostgresAdvisoryLock(params: {
  namespace: string;
  key: string;
}): Promise<PostgresAdvisoryLockLease | undefined> {
  const { url } = assertAdvisoryLockSupported();
  const pool = new Pool({ connectionString: url, max: 1 });
  let sessionClosed = false;
  let client: PoolClient | undefined;

  const closeSession = (options?: { force?: boolean }) =>
    closeLockSession({
      client,
      force: options?.force,
      pool,
      sessionClosed,
      setSessionClosed: () => {
        sessionClosed = true;
      },
    });

  try {
    client = await pool.connect();
    await client.query("SELECT set_config('idle_session_timeout', $1, false)", [
      LOCK_SESSION_IDLE_TIMEOUT,
    ]);

    const { rows } = await client.query<{ acquired: boolean }>(
      'SELECT pg_try_advisory_lock(hashtext($1), hashtext($2)) AS acquired',
      [params.namespace, params.key]
    );
    const acquired = rows[0]?.acquired === true;

    if (!acquired) {
      await closeSession();
      return undefined;
    }

    const heartbeat = createLockSessionHeartbeat(client, closeSession);

    return {
      onLost: heartbeat.onLost,
      release: async (): Promise<void> => {
        try {
          await heartbeat.release();
          await client?.query(
            'SELECT pg_advisory_unlock(hashtext($1), hashtext($2))',
            [params.namespace, params.key]
          );
        } finally {
          await closeSession();
        }
      },
    };
  } catch (error) {
    await closeSession({ force: true }).catch(() => undefined);
    throw error;
  }
}
