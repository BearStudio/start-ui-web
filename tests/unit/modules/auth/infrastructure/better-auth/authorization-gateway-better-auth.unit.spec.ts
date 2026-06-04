import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Auth } from '@/modules/auth/infrastructure/better-auth/auth';
import { AuthorizationGatewayBetterAuth } from '@/modules/auth/infrastructure/better-auth/authorization-gateway-better-auth';
import { toUserId } from '@/modules/kernel/domain/ids';

const telemetryMock = vi.hoisted(() => ({
  startSpan: vi.fn((_options: unknown, fn: () => unknown) => fn()),
}));

vi.mock('@/platform/telemetry', () => ({
  getTelemetry: () => telemetryMock,
}));

const makeAuth = (userHasPermission: ReturnType<typeof vi.fn>): Auth =>
  ({
    api: {
      userHasPermission,
    },
  }) as unknown as Auth;

const makeInput = () => ({
  userId: toUserId('user-1'),
  permissions: { book: ['read'] },
  headers: new Headers(),
});

describe('AuthorizationGatewayBetterAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps granted provider responses to application outcomes', async () => {
    const userHasPermission = vi.fn(async () => ({ success: true }));
    const auth = makeAuth(userHasPermission);
    const gateway = new AuthorizationGatewayBetterAuth(auth);
    const input = makeInput();

    const result = await gateway.userHasPermission(input);

    expect(result.isOk()).toBe(true);
    expect(result).toMatchObject({
      tag: 'Ok',
      value: { type: 'auth_permission_granted' },
    });
    expect(userHasPermission).toHaveBeenCalledWith({
      body: {
        userId: 'user-1',
        permissions: { book: ['read'] },
      },
      headers: input.headers,
    });
    expect(telemetryMock.startSpan).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          'auth.provider': 'better-auth',
          'operation.name': 'auth.userHasPermission',
        }),
        name: 'auth.userHasPermission',
        op: 'auth.provider',
      }),
      expect.any(Function)
    );
  });

  it('maps denied provider responses to application outcomes', async () => {
    const auth = makeAuth(vi.fn(async () => ({ success: false })));
    const gateway = new AuthorizationGatewayBetterAuth(auth);

    const result = await gateway.userHasPermission(makeInput());

    expect(result.isOk()).toBe(true);
    expect(result).toMatchObject({
      tag: 'Ok',
      value: { type: 'auth_permission_denied' },
    });
  });

  it('maps provider error payloads to AppError results', async () => {
    const providerError = new Error('permission provider failed');
    const auth = makeAuth(
      vi.fn(async () => ({ error: providerError, success: false }))
    );
    const gateway = new AuthorizationGatewayBetterAuth(auth);

    const result = await gateway.userHasPermission(makeInput());

    expect(result.isError()).toBe(true);
    expect(result).toMatchObject({
      tag: 'Error',
      error: {
        category: 'system',
        code: 'AUTH_PERMISSION_CHECK_FAILED',
        status: 500,
      },
    });
    expect(result).toHaveProperty('error.cause', providerError);
  });

  it('maps thrown provider failures to AppError results', async () => {
    const providerError = new Error('permission provider threw');
    const auth = makeAuth(
      vi.fn(async () => {
        throw providerError;
      })
    );
    const gateway = new AuthorizationGatewayBetterAuth(auth);

    const result = await gateway.userHasPermission(makeInput());

    expect(result.isError()).toBe(true);
    expect(result).toMatchObject({
      tag: 'Error',
      error: {
        category: 'system',
        code: 'AUTH_PERMISSION_CHECK_FAILED',
        status: 500,
      },
    });
    expect(result).toHaveProperty('error.cause', providerError);
  });
});
