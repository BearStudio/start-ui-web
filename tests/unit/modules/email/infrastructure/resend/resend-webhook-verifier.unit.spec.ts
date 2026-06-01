import type { Resend } from 'resend';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const testState = vi.hoisted(() => ({
  emailConfig: {
    resendApiKey: 'resend_api_key_placeholder', // pragma: allowlist secret
    resendWebhookSecret: 'resend_webhook_secret_placeholder', // pragma: allowlist secret
    from: 'Start UI <noreply@example.com>',
    deliveryDisabled: false,
  },
}));

vi.mock('@/modules/kernel/infrastructure/config/email', () => ({
  getEmailConfig: () => testState.emailConfig,
}));

describe('ResendWebhookVerifier', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    testState.emailConfig.resendWebhookSecret =
      'resend_webhook_secret_placeholder'; // pragma: allowlist secret
  });

  it('verifies the raw payload with the configured webhook secret', async () => {
    const verify = vi.fn(() => ({
      type: 'email.delivered',
      created_at: '2026-01-01T00:00:00.000Z',
      data: {
        email_id: 'email_123',
        created_at: '2026-01-01T00:00:00.000Z',
        from: 'noreply@example.com',
        to: ['user@example.com'],
        subject: 'Login code',
      },
    }));
    const resend = { webhooks: { verify } } as unknown as Resend;
    const { ResendWebhookVerifier } =
      await import('@/modules/email/infrastructure/resend/resend-webhook-verifier');

    const result = new ResendWebhookVerifier(resend).verify({
      payload: '{"type":"email.delivered"}',
      headers: {
        id: 'evt_1',
        timestamp: '1704067200',
        signature: 'sig_1',
      },
    });

    expect(result).toMatchObject({ type: 'email.delivered' });
    expect(verify).toHaveBeenCalledWith({
      payload: '{"type":"email.delivered"}',
      headers: {
        id: 'evt_1',
        timestamp: '1704067200',
        signature: 'sig_1',
      },
      webhookSecret: 'resend_webhook_secret_placeholder', // pragma: allowlist secret
    });
  });

  it('throws AppError when the webhook secret is missing', async () => {
    testState.emailConfig.resendWebhookSecret = undefined as never;
    const resend = { webhooks: { verify: vi.fn() } } as unknown as Resend;
    const { ResendWebhookVerifier } =
      await import('@/modules/email/infrastructure/resend/resend-webhook-verifier');

    expect(() =>
      new ResendWebhookVerifier(resend).verify({
        payload: '{}',
        headers: {
          id: 'evt_1',
          timestamp: '1704067200',
          signature: 'sig_1',
        },
      })
    ).toThrowError(
      expect.objectContaining({
        code: 'EMAIL_WEBHOOK_SECRET_NOT_CONFIGURED',
      })
    );
  });
});
