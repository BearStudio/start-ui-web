import { describe, expect, it } from 'vitest';

import { createAuthCookieSecurityOptions } from './cookie-options';

describe('createAuthCookieSecurityOptions', () => {
  it('uses host-bound secure session cookies for HTTPS origins', () => {
    const options = createAuthCookieSecurityOptions('https://app.example');

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
});
