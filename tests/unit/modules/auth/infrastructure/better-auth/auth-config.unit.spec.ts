import { Result } from '@swan-io/boxed';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  admin: vi.fn(() => ({ id: 'admin-plugin' })),
  betterAuth: vi.fn<(options: ExplicitAny) => ExplicitAny>(() => ({
    handler: vi.fn(),
  })),
  drizzleAdapter: vi.fn(() => ({ id: 'drizzle-adapter' })),
  emailOTP: vi.fn(() => ({ id: 'email-otp-plugin' })),
  openAPI: vi.fn(() => ({ id: 'open-api-plugin' })),
  tanstackStartCookies: vi.fn(() => ({ id: 'tanstack-cookies-plugin' })),
}));

vi.mock('better-auth', () => ({
  betterAuth: mocks.betterAuth,
}));

vi.mock('better-auth/adapters/drizzle', () => ({
  drizzleAdapter: mocks.drizzleAdapter,
}));

vi.mock('better-auth/plugins', () => ({
  admin: mocks.admin,
  emailOTP: mocks.emailOTP,
  openAPI: mocks.openAPI,
}));

vi.mock('better-auth/tanstack-start', () => ({
  tanstackStartCookies: mocks.tanstackStartCookies,
}));

vi.mock('@/modules/kernel/infrastructure/config/auth', () => ({
  getBetterAuthConfig: () => ({
    allowedHosts: ['preview.example'],
    githubClientId: undefined,
    githubClientSecret: undefined,
    secret: 'test-auth-key', // pragma: allowlist secret
    sessionExpirationInSeconds: 2_592_000,
    sessionUpdateAgeInSeconds: 86_400,
    trustedOrigins: ['https://app.example'],
  }),
}));

vi.mock('@/platform/env/client', () => ({
  envClient: {
    DEV: false,
    VITE_BASE_URL: 'https://app.example',
    VITE_IS_DEMO: false,
  },
}));

describe('Better Auth security configuration', () => {
  it('does not disable Better Auth CSRF or origin checks', async () => {
    const { createAuth } = await vi.importActual<
      typeof import('@/modules/auth/infrastructure/better-auth/auth')
    >('@/modules/auth/infrastructure/better-auth/auth');

    createAuth({
      authEmailPort: {
        sendSignInOtp: vi.fn(async () =>
          Result.Ok({ type: 'auth_sign_in_otp_sent' as const })
        ),
      },
    });

    const options = mocks.betterAuth.mock.calls[0]?.[0] as ExplicitAny;

    expect(options.advanced.disableCSRFCheck).toBeUndefined();
    expect(options.advanced.disableOriginCheck).toBeUndefined();
    expect(options.trustedOrigins).toEqual(['https://app.example']);
  });
});
