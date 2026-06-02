import { mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, describe, expect, it, vi } from 'vitest';

const dbPath = join(
  process.cwd(),
  'test-results',
  'unit-telemetry',
  'telemetry.sqlite'
);

vi.mock('@/modules/kernel/infrastructure/config/telemetry', () => ({
  getTelemetryConfig: () => ({
    localSqliteEnabled: true,
    localSqlitePath: dbPath,
  }),
}));

afterEach(() => {
  vi.resetModules();
  rmSync(dirname(dbPath), { force: true, recursive: true });
});

describe('local telemetry SQLite sink', () => {
  it('writes inspectable telemetry summaries', async () => {
    mkdirSync(dirname(dbPath), { recursive: true });
    const { __resetLocalTelemetrySinkForTests, recordLocalTelemetrySummary } =
      await import('@/composition/telemetry/local-sqlite-sink');

    recordLocalTelemetrySummary({
      bytes: 123,
      eventCount: 2,
      kind: 'frontend_log',
      signal: 'logs',
      statusCode: 202,
      summary: { accepted: true },
    });

    const db = new DatabaseSync(dbPath);
    const row = db
      .prepare(
        'SELECT kind, signal, bytes, event_count, status_code, summary_json FROM telemetry_summary'
      )
      .get() as Record<string, unknown>;
    db.close();

    expect(row).toMatchObject({
      bytes: 123,
      event_count: 2,
      kind: 'frontend_log',
      signal: 'logs',
      status_code: 202,
      summary_json: JSON.stringify({ accepted: true }),
    });
    __resetLocalTelemetrySinkForTests();
  });

  it('does not propagate local SQLite setup failures to callers', async () => {
    mkdirSync(dbPath, { recursive: true });
    const { recordLocalTelemetrySummary } =
      await import('@/composition/telemetry/local-sqlite-sink');

    expect(() =>
      recordLocalTelemetrySummary({
        kind: 'otlp_proxy',
        statusCode: 204,
      })
    ).not.toThrow();
  });
});
