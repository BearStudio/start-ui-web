import { mockLogger } from '@tests/server/test-utils';
import { describe, expect, it, vi } from 'vitest';

import { CSP_NONCE_PLACEHOLDER } from '@/platform/http/csp-nonce';

const sentryMiddleware = vi.hoisted(() => ({
  function: { type: 'sentry-function' },
  request: { type: 'sentry-request' },
}));

vi.mock('@sentry/tanstackstart-react', () => ({
  sentryGlobalFunctionMiddleware: sentryMiddleware.function,
  sentryGlobalRequestMiddleware: sentryMiddleware.request,
}));

describe('TanStack Start instance', () => {
  it('adds Sentry, security headers, browser mutation guard, and server-function CSRF middleware', async () => {
    const { startInstance } = await import('@/start');
    const options = (startInstance as ExplicitAny).options;
    const securityHeaders = options.requestMiddleware[1] as ExplicitAny;
    const browserMutationGuard = options.requestMiddleware[2] as ExplicitAny;
    const csrf = options.requestMiddleware[3] as ExplicitAny;

    expect(options.requestMiddleware[0]).toBe(sentryMiddleware.request);
    expect(options.functionMiddleware).toEqual([sentryMiddleware.function]);
    expect(securityHeaders.type).toBe('request');
    expect(browserMutationGuard.type).toBe('request');
    expect(csrf.type).toBe('csrf');
    expect(csrf.options.filter({ handlerType: 'serverFn' })).toBe(true);
    expect(csrf.options.filter({ handlerType: 'router' })).toBe(false);
    expect(csrf.options.secFetchSite).toBe('same-origin');
    expect(csrf.options.referer).toBe(true);
    expect(csrf.options.allowRequestsWithoutOriginCheck).toBeUndefined();
  });

  it('protects only app-owned browser mutation routes', async () => {
    const { shouldProtectBrowserMutation } = await import('@/start');

    expect(
      shouldProtectBrowserMutation({
        handlerType: 'router',
        method: 'POST',
        pathname: '/api/upload',
      })
    ).toBe(true);
    expect(
      shouldProtectBrowserMutation({
        handlerType: 'router',
        method: 'POST',
        pathname: '/logout',
      })
    ).toBe(true);
    expect(
      shouldProtectBrowserMutation({
        handlerType: 'router',
        method: 'POST',
        pathname: '/api/auth/sign-in/email-otp',
      })
    ).toBe(false);
    expect(
      shouldProtectBrowserMutation({
        handlerType: 'router',
        method: 'POST',
        pathname: '/api/webhooks/resend',
      })
    ).toBe(false);
    expect(
      shouldProtectBrowserMutation({
        handlerType: 'serverFn',
        method: 'POST',
        pathname: '/_server',
      })
    ).toBe(false);
  });

  it('rejects untrusted browser mutations and keeps security headers on the response', async () => {
    const { browserMutationGuardMiddleware } = await import('@/start');
    const next = vi.fn();

    const response = await (
      browserMutationGuardMiddleware as ExplicitAny
    ).handler({
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
        reason: 'origin_cross_origin',
      },
      direction: 'inbound',
      event: 'security.browser_mutation_rejected',
    });
    expect(response.status).toBe(403);
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('Content-Security-Policy')).toContain(
      "frame-ancestors 'none'"
    );
    expect(response.headers.get('Content-Security-Policy-Report-Only')).toBe(
      null
    );
    expect(response.headers.get('Vary')).toContain('Sec-Fetch-Site');
  });

  it('applies security headers to successful responses', async () => {
    const { securityHeadersMiddleware } = await import('@/start');
    type NextOptions = { context: { cspNonce: string } };
    const next = vi.fn(async (_options: NextOptions) => ({
      response: new Response(
        `<meta property="csp-nonce" content="${CSP_NONCE_PLACEHOLDER}">`,
        {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        }
      ),
    }));

    const result = await (securityHeadersMiddleware as ExplicitAny).handler({
      next,
    });
    const nextOptions = next.mock.calls[0]?.[0];
    const cspNonce = nextOptions?.context.cspNonce;

    expect(cspNonce).toEqual(expect.any(String));
    expect(result.response.headers.get('X-Content-Type-Options')).toBe(
      'nosniff'
    );
    expect(result.response.headers.get('Referrer-Policy')).toBe(
      'strict-origin-when-cross-origin'
    );
    expect(result.response.headers.get('Content-Security-Policy')).toContain(
      "default-src 'self'"
    );
    expect(result.response.headers.get('Content-Security-Policy')).toContain(
      `script-src 'self' 'nonce-${cspNonce}'`
    );
    expect(result.response.headers.get('Content-Security-Policy')).toContain(
      `style-src 'self' 'nonce-${cspNonce}'`
    );
    expect(result.response.headers.get('Cross-Origin-Opener-Policy')).toBe(
      'same-origin-allow-popups'
    );
    await expect(result.response.text()).resolves.toBe(
      `<meta property="csp-nonce" content="${cspNonce}">`
    );
  });

  it('allows same-origin browser mutations and varies the protected response', async () => {
    const { browserMutationGuardMiddleware } = await import('@/start');
    const next = vi.fn(async () => ({ response: new Response('ok') }));

    const result = await (
      browserMutationGuardMiddleware as ExplicitAny
    ).handler({
      handlerType: 'router',
      next,
      pathname: '/api/upload',
      request: new Request('https://app.example/api/upload', {
        headers: { 'Sec-Fetch-Site': 'same-origin' },
        method: 'POST',
      }),
    });

    expect(next).toHaveBeenCalledOnce();
    expect(result.response.status).toBe(200);
    expect(result.response.headers.get('Vary')).toBe(
      'Sec-Fetch-Site, Origin, Referer'
    );
  });

  it('rejects untrusted browser mutations even when guard logger initialization fails', async () => {
    vi.resetModules();
    vi.doMock('@/modules/kernel/infrastructure/logger/pino', () => ({
      createPinoAppLogger: () => {
        throw new Error('logger init failed');
      },
      createPinoLogger: () => ({}),
    }));

    const { browserMutationGuardMiddleware } = await import('@/start');
    const next = vi.fn();

    const response = await (
      browserMutationGuardMiddleware as ExplicitAny
    ).handler({
      handlerType: 'router',
      next,
      pathname: '/api/upload',
      request: new Request('https://app.example/api/upload', {
        headers: { origin: 'https://evil.example' },
        method: 'POST',
      }),
    });

    expect(next).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
  });
});
