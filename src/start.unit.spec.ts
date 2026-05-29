import { describe, expect, it, vi } from 'vitest';

import { mockLogger } from '@/tests/server/test-utils';

const sentryMiddleware = vi.hoisted(() => ({
  function: { type: 'sentry-function' },
  request: { type: 'sentry-request' },
}));

vi.mock('@sentry/tanstackstart-react', () => ({
  sentryGlobalFunctionMiddleware: sentryMiddleware.function,
  sentryGlobalRequestMiddleware: sentryMiddleware.request,
}));

describe('TanStack Start instance', () => {
  it('adds Sentry, security headers, origin guard, and server-function CSRF middleware', async () => {
    const { startInstance } = await import('./start');
    const options = (startInstance as ExplicitAny).options;
    const securityHeaders = options.requestMiddleware[1] as ExplicitAny;
    const originGuard = options.requestMiddleware[2] as ExplicitAny;
    const csrf = options.requestMiddleware[3] as ExplicitAny;

    expect(options.requestMiddleware[0]).toBe(sentryMiddleware.request);
    expect(options.functionMiddleware).toEqual([sentryMiddleware.function]);
    expect(securityHeaders.type).toBe('request');
    expect(originGuard.type).toBe('request');
    expect(csrf.type).toBe('csrf');
    expect(csrf.options.filter({ handlerType: 'serverFn' })).toBe(true);
    expect(csrf.options.filter({ handlerType: 'router' })).toBe(false);
  });

  it('requires same-origin non-GET requests for protected server routes', async () => {
    const { hasSameOriginHeader, shouldValidateOrigin } =
      await import('./start');

    expect(
      shouldValidateOrigin({
        handlerType: 'router',
        method: 'POST',
        pathname: '/api/upload',
      })
    ).toBe(true);
    expect(
      shouldValidateOrigin({
        handlerType: 'router',
        method: 'POST',
        pathname: '/api/auth/sign-in/email-otp',
      })
    ).toBe(true);
    expect(
      shouldValidateOrigin({
        handlerType: 'router',
        method: 'POST',
        pathname: '/api/webhooks/resend',
      })
    ).toBe(false);
    expect(
      shouldValidateOrigin({
        handlerType: 'serverFn',
        method: 'POST',
        pathname: '/_server',
      })
    ).toBe(false);
    expect(
      hasSameOriginHeader(
        new Request('https://app.example/api/upload', {
          headers: { origin: 'https://app.example' },
        })
      )
    ).toBe(true);
    expect(
      hasSameOriginHeader(
        new Request('https://app.example/api/upload', {
          headers: { origin: 'https://evil.example' },
        })
      )
    ).toBe(false);
  });

  it('rejects foreign origins and keeps security headers on the response', async () => {
    const { originGuardMiddleware } = await import('./start');
    const next = vi.fn();

    const response = await (originGuardMiddleware as ExplicitAny).handler({
      handlerType: 'router',
      next,
      pathname: '/api/upload',
      request: new Request('https://app.example/api/upload', {
        headers: { origin: 'https://evil.example' },
        method: 'POST',
      }),
    });

    expect(next).not.toHaveBeenCalled();
    expect(mockLogger.warn).toHaveBeenCalledWith({
      details: {
        method: 'POST',
        pathname: '/api/upload',
      },
      direction: 'inbound',
      event: 'security.origin_rejected',
    });
    expect(response.status).toBe(403);
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(
      response.headers.get('Content-Security-Policy-Report-Only')
    ).toContain("frame-ancestors 'none'");
  });

  it('applies security headers to successful responses', async () => {
    const { securityHeadersMiddleware } = await import('./start');

    const result = await (securityHeadersMiddleware as ExplicitAny).handler({
      next: async () => ({ response: new Response('ok') }),
    });

    expect(result.response.headers.get('X-Content-Type-Options')).toBe(
      'nosniff'
    );
    expect(result.response.headers.get('Referrer-Policy')).toBe(
      'strict-origin-when-cross-origin'
    );
  });
});
