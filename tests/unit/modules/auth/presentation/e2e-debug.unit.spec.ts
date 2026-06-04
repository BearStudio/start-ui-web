import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const envClientMock = vi.hoisted(() => ({
  VITE_ENV_NAME: 'tests' as string | undefined,
}));

vi.mock('@/platform/env/client', () => ({
  envClient: envClientMock,
}));

function getFirstConsoleInfoPayload() {
  const consoleInfoCall = vi.mocked(console.info).mock.calls.at(0);
  if (!consoleInfoCall) {
    throw new Error('Expected console.info to be called.');
  }

  const [, serializedPayload] = consoleInfoCall;
  return JSON.parse(String(serializedPayload));
}

describe('authE2eDebug', () => {
  beforeEach(() => {
    envClientMock.VITE_ENV_NAME = 'tests';
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redacts sensitive fields and email-shaped values', async () => {
    const { authE2eDebug } =
      await import('@/modules/auth/presentation/e2e-debug');

    authE2eDebug('login.email_otp.submit', {
      email: 'person@example.com',
      message: 'Sent to person@example.com',
      nested: {
        id: 'user-123',
        name: 'Test User',
        safe: 'kept',
      },
    });

    const payload = getFirstConsoleInfoPayload();

    expect(payload).toEqual(
      expect.objectContaining({
        email: '[REDACTED]',
        event: 'login.email_otp.submit',
        message: 'Sent to [REDACTED]',
        nested: {
          id: '[REDACTED]',
          name: '[REDACTED]',
          safe: 'kept',
        },
      })
    );
  });

  it('does not throw when fields contain circular references', async () => {
    const { authE2eDebug } =
      await import('@/modules/auth/presentation/e2e-debug');
    const fields: Record<string, unknown> = { email: 'person@example.com' };
    fields.self = fields;

    expect(() => authE2eDebug('login.email_otp.error', fields)).not.toThrow();

    const payload = getFirstConsoleInfoPayload();

    expect(payload.self).toBe('[Circular]');
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('serializes non-plain debug values and reused references', async () => {
    const { authE2eDebug } =
      await import('@/modules/auth/presentation/e2e-debug');
    const shared = { safe: 'kept' };

    authE2eDebug('login.email_otp.debug', {
      at: new Date('2026-05-26T12:00:00.000Z'),
      first: shared,
      pattern: /login-\d+/i,
      second: shared,
    });

    const payload = getFirstConsoleInfoPayload();

    expect(payload).toEqual(
      expect.objectContaining({
        at: '2026-05-26T12:00:00.000Z',
        first: { safe: 'kept' },
        pattern: '/login-\\d+/i',
        second: { safe: 'kept' },
      })
    );
  });
});
