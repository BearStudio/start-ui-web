import { afterEach, describe, expect, it, vi } from 'vitest';

import { attachRouterObservability } from '@/platform/router/observability';
import {
  createNoOpTelemetry,
  setTelemetry,
  type TelemetryAdapter,
  type TelemetrySpanHandle,
} from '@/platform/telemetry';

type ObservableRouter = Parameters<typeof attachRouterObservability>[0];
type RouterHandler = Parameters<ObservableRouter['subscribe']>[1];

afterEach(() => {
  setTelemetry(createNoOpTelemetry());
  vi.restoreAllMocks();
});

describe('router observability', () => {
  it('does not start navigation spans for hash-only navigation events', () => {
    const telemetry: TelemetryAdapter = {
      ...createNoOpTelemetry(),
      startManualSpan: vi.fn(),
    };
    const handlers = new Map<string, RouterHandler>();
    const router: ObservableRouter = {
      subscribe: (eventType, fn) => {
        handlers.set(eventType, fn);
        return vi.fn();
      },
    };
    setTelemetry(telemetry);
    attachRouterObservability(router);

    handlers.get('onBeforeNavigate')?.({
      hashChanged: true,
      hrefChanged: true,
      pathChanged: false,
      toLocation: {
        href: '/manager/books#details',
        pathname: '/manager/books',
      },
    });

    expect(telemetry.startManualSpan).not.toHaveBeenCalled();
  });

  it('closes an active navigation span before ignoring hash-only navigation', () => {
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
    const handlers = new Map<string, RouterHandler>();
    const router: ObservableRouter = {
      subscribe: (eventType, fn) => {
        handlers.set(eventType, fn);
        return vi.fn();
      },
    };
    setTelemetry(telemetry);
    attachRouterObservability(router);

    handlers.get('onBeforeNavigate')?.({
      toLocation: {
        href: '/manager/books',
        pathname: '/manager/books',
      },
    });
    handlers.get('onBeforeNavigate')?.({
      hashChanged: true,
      hrefChanged: true,
      pathChanged: false,
      toLocation: {
        href: '/manager/books#details',
        pathname: '/manager/books',
      },
    });
    handlers.get('onRendered')?.({
      toLocation: {
        href: '/manager/books',
        pathname: '/manager/books',
      },
    });

    expect(telemetry.startManualSpan).toHaveBeenCalledOnce();
    expect(span.end).toHaveBeenCalledOnce();
    expect(telemetry.recordMetric).not.toHaveBeenCalled();
  });

  it('keeps navigation spans open through onResolved and finishes on onRendered', () => {
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
    const handlers = new Map<string, RouterHandler>();
    const router: ObservableRouter = {
      state: { matches: [{ routeId: '/manager/books/$id/' }] },
      subscribe: (eventType, fn) => {
        handlers.set(eventType, fn);
        return vi.fn();
      },
    };
    vi.spyOn(performance, 'now')
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(175);
    setTelemetry(telemetry);
    attachRouterObservability(router);

    const event = {
      toLocation: {
        href: '/manager/books/c12345678901234567890',
        pathname: '/manager/books/c12345678901234567890',
      },
    };
    handlers.get('onBeforeNavigate')?.(event);
    handlers.get('onResolved')?.(event);

    expect(span.addEvent).toHaveBeenCalledWith('navigation.resolved');
    expect(span.end).not.toHaveBeenCalled();

    handlers.get('onRendered')?.(event);

    expect(span.setAttributes).toHaveBeenCalledWith(
      expect.objectContaining({
        'navigation.duration_ms': 75,
        'navigation.status': 'rendered',
        'route.template': '/manager/books/$id',
      })
    );
    expect(span.setStatus).toHaveBeenCalledWith('ok');
    expect(span.end).toHaveBeenCalledOnce();
    expect(telemetry.recordMetric).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          'navigation.status': 'rendered',
          'route.template': '/manager/books/$id',
        }),
        name: 'app.router.navigation.duration',
        value: 75,
      })
    );
  });
});
