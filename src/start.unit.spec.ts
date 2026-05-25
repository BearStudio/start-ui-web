import { describe, expect, it, vi } from 'vitest';

const sentryMiddleware = vi.hoisted(() => ({
  function: { type: 'sentry-function' },
  request: { type: 'sentry-request' },
}));

vi.mock('@sentry/tanstackstart-react', () => ({
  sentryGlobalFunctionMiddleware: sentryMiddleware.function,
  sentryGlobalRequestMiddleware: sentryMiddleware.request,
}));

describe('TanStack Start instance', () => {
  it('adds Sentry middleware and filters CSRF to server functions', async () => {
    const { startInstance } = await import('./start');
    const options = (startInstance as ExplicitAny).options;
    const csrf = options.requestMiddleware[1] as ExplicitAny;

    expect(options.requestMiddleware[0]).toBe(sentryMiddleware.request);
    expect(options.functionMiddleware).toEqual([sentryMiddleware.function]);
    expect(csrf.type).toBe('csrf');
    expect(csrf.options.filter({ handlerType: 'serverFn' })).toBe(true);
    expect(csrf.options.filter({ handlerType: 'route' })).toBe(false);
  });
});
