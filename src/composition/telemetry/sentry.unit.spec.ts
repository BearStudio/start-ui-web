import { describe, expect, it, vi } from 'vitest';

const sentryMocks = vi.hoisted(() => ({
  init: vi.fn(),
  tanstackRouterBrowserTracingIntegration: vi.fn(() => 'router-tracing'),
}));

vi.mock('@sentry/tanstackstart-react', () => ({
  init: sentryMocks.init,
  tanstackRouterBrowserTracingIntegration:
    sentryMocks.tanstackRouterBrowserTracingIntegration,
}));

vi.mock('@/platform/env/client', () => ({
  envClient: {
    VITE_SENTRY_DSN: '',
    VITE_SENTRY_ENVIRONMENT: undefined,
    VITE_SENTRY_TRACES_SAMPLE_RATE: 0,
  },
}));

describe('Sentry telemetry composition', () => {
  it('is a no-op when no client DSN is configured', async () => {
    const { initTelemetryClient } = await import('./sentry.client');

    initTelemetryClient({});

    expect(sentryMocks.init).not.toHaveBeenCalled();
    expect(
      sentryMocks.tanstackRouterBrowserTracingIntegration
    ).not.toHaveBeenCalled();
  });
});
