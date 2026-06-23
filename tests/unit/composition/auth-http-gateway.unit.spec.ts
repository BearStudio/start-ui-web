import { Result } from '@swan-io/boxed';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const handler = vi.fn(async () => new Response('provider'));
  const testAuthSecret = ['test', 'auth', 'secret'].join('-');

  return {
    authConfig: {
      adminEndpointsEnabled: false,
      allowedHosts: undefined as string[] | undefined,
      githubClientId: undefined as string | undefined,
      githubClientSecret: undefined as string | undefined,
      openApiEnabled: false,
      secret: testAuthSecret,
      sessionExpirationInSeconds: 2_592_000,
      sessionUpdateAgeInSeconds: 86_400,
      trustedOrigins: undefined as string[] | undefined,
    },
    createAuth: vi.fn(() => ({ handler })),
    envClient: { VITE_IS_DEMO: false },
    handler,
  };
});

vi.mock('@/modules/kernel/infrastructure/config/auth', () => ({
  getAuthProviderConfig: () => ({ provider: 'better-auth' }),
  getBetterAuthConfig: () => mocks.authConfig,
}));

vi.mock('@/modules/auth/infrastructure/better-auth/auth', () => ({
  createAuth: mocks.createAuth,
}));

vi.mock('@/platform/env/client', () => ({
  envClient: mocks.envClient,
}));

const authEmailPort = {
  sendSignInOtp: vi.fn(async () =>
    Result.Ok({ type: 'auth_sign_in_otp_sent' as const })
  ),
};

describe('auth HTTP gateway exposure policy', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.authConfig.adminEndpointsEnabled = false;
    mocks.authConfig.openApiEnabled = false;
    mocks.envClient.VITE_IS_DEMO = false;
    mocks.handler.mockResolvedValue(new Response('provider'));
  });

  it('returns 404 for admin HTTP endpoints in demo mode even when enabled', async () => {
    mocks.authConfig.adminEndpointsEnabled = true;
    mocks.envClient.VITE_IS_DEMO = true;
    const { getAuthHttpGateway } = await import('@/composition/auth');

    const gateway = getAuthHttpGateway({ authEmailPort });
    const response = await gateway.handle(
      new Request('http://localhost/api/auth/admin/remove-user', {
        method: 'POST',
      })
    );

    expect(response.status).toBe(404);
    expect(mocks.handler).not.toHaveBeenCalled();
  });

  it('still forwards core auth endpoints in demo mode', async () => {
    mocks.authConfig.adminEndpointsEnabled = true;
    mocks.envClient.VITE_IS_DEMO = true;
    const { getAuthHttpGateway } = await import('@/composition/auth');

    const gateway = getAuthHttpGateway({ authEmailPort });
    const response = await gateway.handle(
      new Request('http://localhost/api/auth/sign-in/email-otp', {
        method: 'POST',
      })
    );

    await expect(response.text()).resolves.toBe('provider');
    expect(mocks.handler).toHaveBeenCalledOnce();
  });
});
