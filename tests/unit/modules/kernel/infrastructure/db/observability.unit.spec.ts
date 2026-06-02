import { Result } from '@swan-io/boxed';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { observeRepository } from '@/modules/kernel/infrastructure/db/observability';
import { timingStore } from '@/modules/kernel/transport/tanstack/timing-store';
import {
  createNoOpTelemetry,
  setTelemetry,
  type TelemetryAdapter,
  type TelemetrySpanHandle,
} from '@/platform/telemetry';

afterEach(() => {
  setTelemetry(createNoOpTelemetry());
  vi.restoreAllMocks();
});

describe('database observability', () => {
  it('wraps repository methods with spans, metrics, and Server-Timing entries', async () => {
    const span: TelemetrySpanHandle = {
      addEvent: vi.fn(),
      end: vi.fn(),
      recordException: vi.fn(),
      setAttributes: vi.fn(),
      setStatus: vi.fn(),
    };
    const telemetry: TelemetryAdapter = {
      ...createNoOpTelemetry(),
      recordMetric: vi.fn(),
      startManualSpan: vi.fn(() => span),
    };
    const repository = observeRepository(
      {
        async list() {
          return Result.Ok({ type: 'listed' as const });
        },
      },
      'book'
    );
    vi.spyOn(performance, 'now')
      .mockReturnValueOnce(50)
      .mockReturnValueOnce(80);
    setTelemetry(telemetry);

    await timingStore.run({ db: [] }, async () => {
      await repository.list();

      expect(timingStore.getStore()?.db).toEqual([
        { duration: 30, model: 'book', operation: 'list' },
      ]);
    });

    expect(telemetry.startManualSpan).toHaveBeenCalledWith({
      attributes: {
        'db.collection.name': 'book',
        'db.operation.name': 'list',
        'db.system': 'postgresql',
      },
      name: 'db.book.list',
      op: 'db.repository',
    });
    expect(span.setStatus).toHaveBeenCalledWith('ok');
    expect(span.end).toHaveBeenCalledOnce();
    expect(telemetry.recordMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          'db.collection.name': 'book',
          'db.operation.duration_ms': 30,
          'db.operation.name': 'list',
          status: 'success',
        }),
        name: 'app.db.operation.duration',
        value: 30,
      })
    );
  });

  it('marks Result.Error repository outcomes as telemetry errors', async () => {
    const span: TelemetrySpanHandle = {
      addEvent: vi.fn(),
      end: vi.fn(),
      recordException: vi.fn(),
      setAttributes: vi.fn(),
      setStatus: vi.fn(),
    };
    const telemetry: TelemetryAdapter = {
      ...createNoOpTelemetry(),
      recordMetric: vi.fn(),
      startManualSpan: vi.fn(() => span),
    };
    const repository = observeRepository(
      {
        list() {
          return Result.Error(new Error('db failed'));
        },
      },
      'book'
    );
    vi.spyOn(performance, 'now')
      .mockReturnValueOnce(10)
      .mockReturnValueOnce(12);
    setTelemetry(telemetry);

    repository.list();

    expect(span.setStatus).toHaveBeenCalledWith('error');
    expect(telemetry.recordMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({ status: 'error' }),
        value: 2,
      })
    );
  });
});
