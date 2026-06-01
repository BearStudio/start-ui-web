import { createHash } from 'node:crypto';
import { Result } from '@swan-io/boxed';
import { describe, expect, it, vi } from 'vitest';

import type { EmailGateway } from '@/modules/email';

vi.mock('@/platform/lib/i18n', () => ({
  default: {
    getFixedT: () => (key: string) => `translated:${key}`,
  },
}));

describe('AuthEmailPortResend', () => {
  it('sends OTP emails through EmailGateway with deterministic hashed idempotency keys', async () => {
    const sendEmail = vi.fn(async () =>
      Result.Ok({
        type: 'email_send_recorded' as const,
        provider: 'resend' as const,
        externalId: 'email_123',
      })
    );
    const gateway = { sendEmail } satisfies EmailGateway;
    const { AuthEmailPortResend } =
      await import('@/modules/auth/infrastructure/better-auth/auth-email-port-resend');

    const result = await new AuthEmailPortResend(gateway).sendSignInOtp({
      email: ' User@Example.com ',
      otp: '123456',
      language: 'en',
    });

    const expectedDigest = createHash('sha256')
      .update('user@example.com|123456|en')
      .digest('hex');
    const idempotencyKey = `auth:sign-in-otp:v1:${expectedDigest}`;

    expect(sendEmail).toHaveBeenCalledWith({
      to: ' User@Example.com ',
      subject: 'translated:loginCode.subject',
      template: expect.any(Object),
      idempotencyKey,
      metadata: {
        source: 'auth.signInOtp',
        language: 'en',
      },
    });
    expect(idempotencyKey).not.toContain('User@Example.com');
    expect(idempotencyKey).not.toContain('123456');
    expect(
      result.match({ Ok: (outcome) => outcome, Error: () => null })
    ).toEqual({
      type: 'auth_sign_in_otp_sent',
    });
  });
});
