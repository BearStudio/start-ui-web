import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  observeBeforeLoad,
  observedLoader,
} from '@/platform/router/route-observability';
import {
  createNoOpTelemetry,
  setTelemetry,
  type TelemetryAdapter,
} from '@/platform/telemetry';

const makeTelemetry = (): TelemetryAdapter => ({
  ...createNoOpTelemetry(),
  recordMetric: vi.fn(),
  startSpan: vi.fn((_options, fn) => fn()),
});

afterEach(() => {
  setTelemetry(createNoOpTelemetry());
});

describe('route observability helpers', () => {
  it('wraps route loaders in route-level spans and metrics', async () => {
    const telemetry = makeTelemetry();
    setTelemetry(telemetry);
    const loader = observedLoader('/manager/books/$id/', async () => 'book');

    await expect(loader()).resolves.toBe('book');

    expect(telemetry.startSpan).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'route.loader /manager/books/$id',
        op: 'router.loader',
      }),
      expect.any(Function)
    );
    expect(telemetry.recordMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          'route.phase': 'loader',
          'route.template': '/manager/books/$id',
          status: 'success',
        }),
        name: 'app.route.boundary.duration',
      })
    );
  });

  it('records beforeLoad failures with error status', () => {
    const telemetry = makeTelemetry();
    setTelemetry(telemetry);

    expect(() =>
      observeBeforeLoad('/login', () => {
        throw new Error('redirect');
      })
    ).toThrow('redirect');

    expect(telemetry.recordMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          'route.phase': 'beforeLoad',
          status: 'error',
        }),
      })
    );
  });
});
