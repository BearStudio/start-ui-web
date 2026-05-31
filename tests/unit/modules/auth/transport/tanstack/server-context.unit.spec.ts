import { setResponseHeader } from '@tanstack/react-start/server';
import { describe, expect, it, vi } from 'vitest';

import {
  createServerContextTools,
  withProtectedMutation,
  withPublicContext,
} from '@/modules/auth/backend';
import { ServerFnError } from '@/modules/kernel/client';
import { envClient } from '@/platform/env/client';
import { mockGetSession, mockLogger } from '@tests/server/test-utils';

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
      captureException: vi.fn(),
      setUser: vi.fn(),
      startSpan: vi.fn((_options, fn) => fn()),
    };
    const tools = createServerContextTools({
      getAuthUseCases: () =>
        ({
          getCurrentSession: mockGetSession,
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

  it('maps auth context construction errors through the central handler', async () => {
    const error = new Error('auth unavailable');
    mockGetSession.mockRejectedValueOnce(error);

    await expect(withPublicContext(async () => 'ok')).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
    });
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'server_fn.error.unhandled',
        exception: error,
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
