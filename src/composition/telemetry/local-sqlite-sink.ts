import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { getTelemetryConfig } from '@/modules/kernel/infrastructure/config/telemetry';

type LocalTelemetrySummary = {
  kind: 'frontend_log' | 'otlp_proxy' | 'sentry_tunnel';
  signal?: 'logs' | 'metrics' | 'traces';
  bytes?: number;
  eventCount?: number;
  statusCode?: number;
  summary?: Record<string, unknown>;
};

let database: DatabaseSync | undefined;

const resetDatabase = () => {
  try {
    database?.close();
  } catch {
    // The connection may already be unusable; clearing it is enough.
  }
  database = undefined;
};

const getDatabase = () => {
  const config = getTelemetryConfig();
  if (!config.localSqliteEnabled) return undefined;

  if (!database) {
    const directory = dirname(config.localSqlitePath);
    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true });
    }

    database = new DatabaseSync(config.localSqlitePath);
    database.exec(`
      CREATE TABLE IF NOT EXISTS telemetry_summary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        kind TEXT NOT NULL,
        signal TEXT,
        bytes INTEGER,
        event_count INTEGER,
        status_code INTEGER,
        summary_json TEXT NOT NULL
      )
    `);
  }

  return database;
};

export const recordLocalTelemetrySummary = (input: LocalTelemetrySummary) => {
  try {
    const db = getDatabase();
    if (!db) return;

    db.prepare(
      `
        INSERT INTO telemetry_summary (
          kind,
          signal,
          bytes,
          event_count,
          status_code,
          summary_json
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `
    ).run(
      input.kind,
      input.signal ?? null,
      input.bytes ?? null,
      input.eventCount ?? null,
      input.statusCode ?? null,
      JSON.stringify(input.summary ?? {})
    );
  } catch {
    resetDatabase();
    // Local telemetry persistence must never turn observability into app failure.
  }
};

/** Test-only. */
export const __resetLocalTelemetrySinkForTests = () => {
  resetDatabase();
};
