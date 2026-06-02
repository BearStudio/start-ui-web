import { describe, expect, it } from 'vitest';

import { createAuthCookieSecurityOptions } from '@/modules/auth/infrastructure/better-auth/cookie-options';

describe('createAuthCookieSecurityOptions', () => {
  it('uses host-bound secure session cookies for HTTPS origins', () => {
    const options = createAuthCookieSecurityOptions('https://app.example', {
      isProduction: true,
    });

    expect(options.useSecureCookies).toBe(false);
    expect(options.defaultCookieAttributes).toEqual({
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: true,
    });
    expect(options.cookies?.session_token).toEqual({
      attributes: {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: true,
      },
      name: '__Host-session',
    });
    expect(options.cookies?.session_token).not.toHaveProperty('domain');
  });

  it('keeps local HTTP development cookies non-secure and avoids __Host naming', () => {
    const options = createAuthCookieSecurityOptions('http://localhost:3000');

    expect(options.defaultCookieAttributes).toEqual({
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: false,
    });
    expect(options.cookies).toBeUndefined();
  });

  it.each([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://[::1]:3000',
  ])('allows local HTTP cookie configuration for %s', (baseUrl) => {
    expect(() =>
      createAuthCookieSecurityOptions(baseUrl, { isProduction: true })
    ).not.toThrow();
  });

  it('rejects production HTTP cookies for non-localhost origins', () => {
    expect(() =>
      createAuthCookieSecurityOptions('http://app.example', {
        isProduction: true,
      })
    ).toThrow(/HTTPS VITE_BASE_URL/);
  });
});
