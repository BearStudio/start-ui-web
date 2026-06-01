import { describe, expect, it } from 'vitest';

import {
  appendVaryHeader,
  applySecurityHeaders,
  buildContentSecurityPolicy,
  getSecurityHeaders,
} from '@/platform/http/security-headers';

describe('security headers', () => {
  it('builds an enforced CSP with configured image and connection origins', () => {
    const policy = buildContentSecurityPolicy({
      baseUrl: 'https://app.example',
      isProduction: true,
      s3BucketPublicUrl: 'https://assets.example/books',
      sentryDsn: 'https://public@o123.ingest.sentry.io/456',
    });

    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).toContain("script-src 'self'");
    expect(policy).not.toContain("script-src 'self' 'unsafe-inline'");
    expect(policy).toContain("script-src-attr 'none'");
    expect(policy).toContain("style-src 'self' 'unsafe-inline'");
    expect(policy).toContain(
      "img-src 'self' data: blob: https://assets.example https://raw.githubusercontent.com"
    );
    expect(policy).toContain(
      "connect-src 'self' https://assets.example https://o123.ingest.sentry.io"
    );
    expect(policy).toContain("font-src 'self' data:");
    expect(policy).toContain("manifest-src 'self'");
    expect(policy).toContain("media-src 'self' blob:");
    expect(policy).toContain("worker-src 'self' blob:");
    expect(policy).toContain("frame-src 'none'");
    expect(policy).toContain('upgrade-insecure-requests');
  });

  it('does not add HTTPS upgrade directives outside production HTTPS', () => {
    expect(
      buildContentSecurityPolicy({
        baseUrl: 'http://localhost:3000',
        isProduction: true,
      })
    ).not.toContain('upgrade-insecure-requests');
    expect(
      buildContentSecurityPolicy({
        baseUrl: 'https://app.example',
        isProduction: false,
      })
    ).not.toContain('upgrade-insecure-requests');
  });

  it('returns security headers without report-only CSP', () => {
    const headers = getSecurityHeaders({
      isProduction: true,
    });

    expect(headers['Content-Security-Policy']).toContain("default-src 'self'");
    expect(headers['Content-Security-Policy-Report-Only']).toBeUndefined();
    expect(headers['Cross-Origin-Opener-Policy']).toBe(
      'same-origin-allow-popups'
    );
    expect(headers['Cross-Origin-Resource-Policy']).toBe('same-origin');
    expect(headers['Origin-Agent-Cluster']).toBe('?1');
    expect(headers['Strict-Transport-Security']).toBe(
      'max-age=63072000; includeSubDomains; preload'
    );
  });

  it('applies security headers and removes stale report-only CSP', () => {
    const response = new Response('ok', {
      headers: {
        'Content-Security-Policy-Report-Only': "default-src 'none'",
      },
    });

    applySecurityHeaders(response);

    expect(response.headers.get('Content-Security-Policy')).toContain(
      "default-src 'self'"
    );
    expect(response.headers.get('Content-Security-Policy-Report-Only')).toBe(
      null
    );
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('appends Vary values without losing existing values or adding duplicates', () => {
    const response = new Response('ok', {
      headers: {
        Vary: 'Cookie, origin',
      },
    });

    appendVaryHeader(response, ['Origin', 'Sec-Fetch-Site', 'Referer']);

    expect(response.headers.get('Vary')).toBe(
      'Cookie, origin, Sec-Fetch-Site, Referer'
    );
  });

  it('keeps wildcard Vary as the only value', () => {
    const response = new Response('ok', {
      headers: {
        Vary: 'Cookie, *',
      },
    });

    appendVaryHeader(response, ['Origin']);

    expect(response.headers.get('Vary')).toBe('*');
  });
});
