type SameSite = 'lax' | 'strict' | 'none';

export type AuthCookieAttributes = {
  httpOnly: true;
  path: '/';
  sameSite: SameSite;
  secure: boolean;
};

export type AuthCookieSecurityOptions = {
  cookies?: {
    session_token: {
      attributes: AuthCookieAttributes;
      name: '__Host-session';
    };
  };
  defaultCookieAttributes: AuthCookieAttributes;
  useSecureCookies: false;
};

export function createAuthCookieSecurityOptions(
  baseUrl: string
): AuthCookieSecurityOptions {
  const secure = new URL(baseUrl).protocol === 'https:';
  const attributes = {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure,
  } satisfies AuthCookieAttributes;

  return {
    defaultCookieAttributes: attributes,
    useSecureCookies: false,
    ...(secure
      ? {
          cookies: {
            session_token: {
              attributes,
              name: '__Host-session',
            },
          },
        }
      : undefined),
  };
}
