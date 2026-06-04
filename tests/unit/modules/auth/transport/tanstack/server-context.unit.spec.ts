import { Result } from '@swan-io/boxed';
import { getGlobalStartContext } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createServerContextTools,
  withProtectedMutation,
  withPublicContext,
} from '@/modules/auth/backend';
import { toUserId } from '@/modules/kernel';
import { ServerFnError } from '@/modules/kernel/client';
import { envClient } from '@/platform/env/client';
import { createNoOpTelemetry } from '@/platform/telemetry';
import {
  mockGetSession,
  mockLogger,
  mockSession,
  mockUser,
} from '@tests/server/test-utils';

const getGlobalStartContextMock = vi.mocked(getGlobalStartContext);

beforeEach(() => {
  getGlobalStartContextMock.mockReturnValue(undefined as never);
});

describe('server function middleware', () => {
  it('finalizes server timing on handled error paths', async () => {
    await expect(
      withPublicContext(async () => {
        throw new ServerFnError('BAD_REQUEST');
      })
    ).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });

    expect(setResponseHeader).toHaveBeenCalledWith(
      'Server-Timing',
      expect.stringContaining('global;dur=')
    );
  });

  it('sets protected cache headers and request scope for authenticated server functions', async () => {
    await expect(
      withPublicContext(async (ctx) => ({
        scope: ctx.scope,
        userId: ctx.user?.id,
      }))
    ).resolves.toEqual({
      scope: {
        userId: 'user-1',
        role: 'user',
      },
      userId: 'user-1',
    });

    expect(setResponseHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'private, no-store'
    );
    expect(setResponseHeader).toHaveBeenCalledWith(
      'Vary',
      'Cookie, Authorization'
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'server_fn.request.finish',
        requestId: expect.any(String),
        sessionId: 'session-1',
        scopeKey: 'user:user-1:role:user',
        userId: 'user-1',
      })
    );
  });

  it('binds authenticated users through the telemetry adapter', async () => {
    const telemetry = {
      ...createNoOpTelemetry(),
      captureException: vi.fn(),
      setUser: vi.fn(),
      startSpan: vi.fn((_options, fn) => fn()),
    };
    const getCurrentSession = vi.fn(async () =>
      Result.Ok({
        type: 'auth_session_found' as const,
        session: {
          session: mockSession,
          user: mockUser,
        },
      })
    );
    const tools = createServerContextTools({
      getAuthUseCases: () =>
        ({
          getCurrentSession,
          checkPermission: vi.fn(),
        }) as ExplicitAny,
      telemetry,
    });

    await expect(tools.withPublicContext(async () => 'ok')).resolves.toBe('ok');

    expect(telemetry.setUser).toHaveBeenCalledWith({
      id: 'user-1',
      email: 'user@example.com',
      role: 'user',
    });
  });

  it('uses Start request auth context and request id when available', async () => {
    const getSession = vi.fn(async () => ({
      session: mockSession,
      user: mockUser,
    }));
    const getCurrentSession = vi.fn();
    getGlobalStartContextMock.mockReturnValue({
      auth: { getSession },
      requestId: 'request-1',
    } as never);
    const tools = createServerContextTools({
      getAuthUseCases: () =>
        ({
          getCurrentSession,
          checkPermission: vi.fn(),
        }) as ExplicitAny,
      logger: mockLogger,
    });

    await expect(tools.withPublicContext(async () => 'ok')).resolves.toBe('ok');

    expect(getSession).toHaveBeenCalledOnce();
    expect(getCurrentSession).not.toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'server_fn.request.finish',
        requestId: 'request-1',
      })
    );
  });

  it('fails closed for unexpected permission outcomes', async () => {
    const checkPermission = vi.fn(async () =>
      Result.Ok({ type: 'auth_permission_unknown' as const })
    );
    const tools = createServerContextTools({
      getAuthUseCases: () =>
        ({
          getCurrentSession: vi.fn(),
          checkPermission,
        }) as ExplicitAny,
    });

    await expect(
      tools.assertPermission(toUserId('user-1'), { book: ['read'] })
    ).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('maps auth context construction errors through the central handler', async () => {
    const error = new Error('auth unavailable');
    mockGetSession.mockRejectedValueOnce(error);

    await expect(withPublicContext(async () => 'ok')).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
    });
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'server_fn.error.unhandled',
        exception: expect.objectContaining({
          cause: error,
          code: 'AUTH_SESSION_GATEWAY_ERROR',
        }),
      })
    );
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        details: expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
        }),
        event: 'server_fn.error.mapped',
      })
    );
  });

  it('runs demo-mode mutation checks inside protected middleware handling', async () => {
    vi.mocked(envClient).VITE_IS_DEMO = true;

    try {
      await expect(
        withProtectedMutation(async () => 'ok')
      ).rejects.toMatchObject({
        code: 'METHOD_NOT_SUPPORTED',
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            code: 'METHOD_NOT_SUPPORTED',
            data: { reason: 'DEMO_MODE_ENABLED' },
          }),
          error: 'Demo mode prevents mutations',
          event: 'server_fn.error.mapped',
        })
      );
    } finally {
      vi.mocked(envClient).VITE_IS_DEMO = false;
    }
  });

  it('logs expected transport errors at warning level', async () => {
    await expect(
      withPublicContext(async () => {
        throw new ServerFnError('CONFLICT', {
          message: 'Unique constraint violation',
          data: { target: ['email'] },
        });
      })
    ).rejects.toMatchObject({
      code: 'CONFLICT',
      data: { target: ['email'] },
    });

    expect(mockLogger.warn).toHaveBeenCalledTimes(1);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        details: expect.objectContaining({
          code: 'CONFLICT',
          data: { target: ['email'] },
        }),
        event: 'server_fn.error.mapped',
      })
    );
    expect(mockLogger.error).not.toHaveBeenCalled();
  });
});
