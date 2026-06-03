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
    expect(span.setAttributes).toHaveBeenCalledWith(
      expect.objectContaining({
        'db.operation.duration_ms': 30,
        status: 'success',
      })
    );
    expect(telemetry.recordMetric).toHaveBeenCalledOnce();
    const metric = vi.mocked(telemetry.recordMetric).mock.calls[0]![0];
    expect(metric).toEqual(
      expect.objectContaining({
        attributes: expect.objectContaining({
          'db.collection.name': 'book',
          'db.operation.name': 'list',
          status: 'success',
        }),
        name: 'app.db.operation.duration',
        value: 30,
      })
    );
    expect(metric.attributes).not.toHaveProperty('db.operation.duration_ms');
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
    expect(telemetry.recordMetric).toHaveBeenCalledOnce();
    const metric = vi.mocked(telemetry.recordMetric).mock.calls[0]![0];
    expect(metric.attributes).not.toHaveProperty('db.operation.duration_ms');
  });

  it('does not let telemetry completion failures replace repository results', () => {
    const span: TelemetrySpanHandle = {
      addEvent: vi.fn(() => {
        throw new Error('span event failed');
      }),
      end: vi.fn(() => {
        throw new Error('span end failed');
      }),
      recordException: vi.fn(() => {
        throw new Error('span exception failed');
      }),
      setAttributes: vi.fn(() => {
        throw new Error('span attributes failed');
      }),
      setStatus: vi.fn(() => {
        throw new Error('span status failed');
      }),
    };
    const telemetry: TelemetryAdapter = {
      ...createNoOpTelemetry(),
      recordMetric: vi.fn(() => {
        throw new Error('metric failed');
      }),
      startManualSpan: vi.fn(() => span),
    };
    const repository = observeRepository(
      {
        list() {
          return Result.Ok({ type: 'listed' as const });
        },
      },
      'book'
    );
    setTelemetry(telemetry);

    expect(repository.list()).toEqual(Result.Ok({ type: 'listed' }));
  });

  it('does not let span creation failures skip repository work', () => {
    const telemetry: TelemetryAdapter = {
      ...createNoOpTelemetry(),
      recordMetric: vi.fn(),
      startManualSpan: vi.fn(() => {
        throw new Error('span failed');
      }),
    };
    const repository = observeRepository(
      {
        list() {
          return 'listed';
        },
      },
      'book'
    );
    setTelemetry(telemetry);

    expect(repository.list()).toBe('listed');
    expect(telemetry.recordMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'app.db.operation.duration',
      })
    );
  });

  it('rethrows repository failures even when telemetry completion fails', () => {
    const span: TelemetrySpanHandle = {
      addEvent: vi.fn(),
      end: vi.fn(() => {
        throw new Error('span end failed');
      }),
      recordException: vi.fn(() => {
        throw new Error('span exception failed');
      }),
      setAttributes: vi.fn(),
      setStatus: vi.fn(() => {
        throw new Error('span status failed');
      }),
    };
    const telemetry: TelemetryAdapter = {
      ...createNoOpTelemetry(),
      recordMetric: vi.fn(() => {
        throw new Error('metric failed');
      }),
      startManualSpan: vi.fn(() => span),
    };
    const repository = observeRepository(
      {
        list() {
          throw new Error('repository failed');
        },
      },
      'book'
    );
    setTelemetry(telemetry);

    expect(() => repository.list()).toThrow('repository failed');
  });
});
