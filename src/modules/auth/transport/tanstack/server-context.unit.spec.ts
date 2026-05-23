import { setResponseHeader } from '@tanstack/react-start/server';
import { describe, expect, it, vi } from 'vitest';

import {
  withProtectedMutation,
  withPublicContext,
} from '@/modules/auth/server';
import { ServerFnError } from '@/modules/kernel/server';
import { envClient } from '@/platform/env/client';
import { mockGetSession, mockLogger } from '@/tests/server/test-utils';

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

  it('maps auth context construction errors through the central handler', async () => {
    const error = new Error('auth unavailable');
    mockGetSession.mockRejectedValueOnce(error);

    await expect(withPublicContext(async () => 'ok')).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
    });
    expect(mockLogger.error).toHaveBeenCalledWith(
      error,
      'Unhandled error before mapping'
    );
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'INTERNAL_SERVER_ERROR',
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
          code: 'METHOD_NOT_SUPPORTED',
          message: 'DEMO_MODE_ENABLED',
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
    expect(mockLogger.error).not.toHaveBeenCalled();
  });
});
