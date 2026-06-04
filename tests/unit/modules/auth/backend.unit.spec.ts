import { beforeEach, describe, expect, it, vi } from 'vitest';

const authBackendMocks = vi.hoisted(() => {
  const logger = {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  };

  return {
    authHttpGateway: {
      handle: vi.fn(),
    },
    logger,
    signOut: vi.fn(),
    telemetry: {
      startSpan: vi.fn((_options: unknown, fn: () => unknown) => fn()),
    },
  };
});

vi.mock('@/composition/auth', () => ({
  getAuth: vi.fn(() => ({
    api: {
      signOut: authBackendMocks.signOut,
    },
  })),
  getAuthHttpGateway: vi.fn(() => authBackendMocks.authHttpGateway),
  getAuthUseCases: vi.fn(() => ({
    getCurrentSession: vi.fn(),
  })),
}));

vi.mock('@/composition/kernel', () => ({
  getKernel: vi.fn(() => ({
    logger: authBackendMocks.logger,
  })),
}));

vi.mock('@/composition/telemetry', () => ({
  telemetryProxy: authBackendMocks.telemetry,
}));

vi.mock('@/modules/auth/transport/tanstack/server-context', () => ({
  createServerContextTools: vi.fn(() => ({
    assertPermission: vi.fn(),
    withProtectedContext: vi.fn(),
    withProtectedMutation: vi.fn(),
    withPublicContext: vi.fn(),
  })),
}));

describe('auth backend handlers', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    authBackendMocks.telemetry.startSpan.mockImplementation(
      (_options: unknown, fn: () => unknown) => fn()
    );
  });

  it('wraps auth HTTP requests in a telemetry span', async () => {
    const response = new Response('ok', { status: 202 });
    authBackendMocks.authHttpGateway.handle.mockResolvedValueOnce(response);
    const { handleAuthRequest } = await import('@/modules/auth/backend');
    const request = new Request('https://app.example/api/auth/sign-in', {
      method: 'POST',
    });

    await expect(handleAuthRequest(request)).resolves.toBe(response);

    expect(authBackendMocks.telemetry.startSpan).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          'auth.provider': 'better-auth',
          'http.request.method': 'POST',
          'operation.name': 'auth.httpRequest',
          'operation.type': 'http_handler',
        }),
        name: 'auth.httpRequest',
        op: 'auth.http',
      }),
      expect.any(Function)
    );
    expect(authBackendMocks.authHttpGateway.handle).toHaveBeenCalledWith(
      request
    );
  });

  it('wraps logout requests in a telemetry span', async () => {
    const response = new Response(null, { status: 204 });
    authBackendMocks.signOut.mockResolvedValueOnce(response);
    const { handleLogoutRequest } = await import('@/modules/auth/backend');
    const request = new Request('https://app.example/logout', {
      headers: { cookie: 'session=abc' },
      method: 'POST',
    });

    await expect(handleLogoutRequest(request)).resolves.toBe(response);

    expect(authBackendMocks.telemetry.startSpan).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          'auth.provider': 'better-auth',
          'http.request.method': 'POST',
          'operation.name': 'auth.signOut',
          'operation.type': 'provider_operation',
        }),
        name: 'auth.signOut',
        op: 'auth.provider',
      }),
      expect.any(Function)
    );
    expect(authBackendMocks.signOut).toHaveBeenCalledWith({
      asResponse: true,
      headers: request.headers,
    });
  });
});
