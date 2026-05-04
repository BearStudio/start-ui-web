import { setResponseHeader } from '@tanstack/react-start/server';
import { describe, expect, it, vi } from 'vitest';

import { envClient } from '@/env/client';
import { mockGetSession, mockLogger } from '@/server/functions/test-utils';
import {
  isPgError,
  withProtectedMutation,
  withPublicContext,
} from '@/server/middlewares.server';
import { ServerFnError } from '@/server/server-fn-error';

const buildPgError = (
  overrides: Partial<
    Error & {
      code: string;
      constraint: string;
      file: string;
      line: string;
      routine: string;
      severity: string;
    }
  > = {}
) =>
  Object.assign(new Error('PG error'), {
    code: '23505',
    file: 'nbtinsert.c',
    line: '666',
    routine: '_bt_check_unique',
    severity: 'ERROR',
    ...overrides,
  });

describe('isPgError', () => {
  it('accepts Postgres-shaped errors', () => {
    expect(isPgError(buildPgError())).toBe(true);
  });

  it('rejects generic coded errors', () => {
    const error = Object.assign(new Error('Conflict'), { code: '23505' });

    expect(isPgError(error)).toBe(false);
  });

  it('rejects non-Postgres error codes', () => {
    const error = buildPgError({ code: 'BAD_CODE' });

    expect(isPgError(error)).toBe(false);
  });

  it('rejects plain objects with Postgres-looking fields', () => {
    const error = {
      code: '23505',
      file: 'nbtinsert.c',
      line: '666',
      routine: '_bt_check_unique',
      severity: 'ERROR',
    };

    expect(isPgError(error)).toBe(false);
  });
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

  it('logs mapped Postgres conflicts once at warning level', async () => {
    await expect(
      withPublicContext(async () => {
        throw buildPgError({ constraint: 'user_email_key' });
      })
    ).rejects.toMatchObject({
      code: 'CONFLICT',
      data: { target: ['email'] },
    });

    expect(mockLogger.warn).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).not.toHaveBeenCalled();
  });
});
