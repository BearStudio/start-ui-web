import { createElement } from 'react';
import type { Resend } from 'resend';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { EmailStatusRepository } from '@/modules/email';

const testState = vi.hoisted(() => ({
  emailConfig: {
    resendApiKey: 're_test',
    resendWebhookSecret: 'whsec_test',
    from: 'Start UI <noreply@example.com>',
    deliveryDisabled: false,
  },
  envClient: {
    VITE_IS_DEMO: false,
  },
  render: vi.fn(),
}));

vi.mock('@/modules/kernel/infrastructure/config/email', () => ({
  getEmailConfig: () => testState.emailConfig,
}));

vi.mock('@/platform/env/client', () => ({
  envClient: testState.envClient,
}));

vi.mock('@react-email/render', () => ({
  render: testState.render,
}));

const makeStatusRepository = (): EmailStatusRepository =>
  ({
    recordSendAttempt: vi.fn(async () => ({
      id: 'status-1',
      provider: 'resend' as const,
      externalId: null,
      recipient: 'user@example.com',
      subject: 'Login code',
      status: 'send_attempted' as const,
      idempotencyKey: 'key-1',
      lastWebhookEventId: null,
      metadata: {},
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })),
    upsertStatusByExternalId: vi.fn(async () => ({
      id: 'status-1',
      provider: 'resend' as const,
      externalId: 'email_123',
      recipient: 'user@example.com',
      subject: 'Login code',
      status: 'sent' as const,
      idempotencyKey: 'key-1',
      lastWebhookEventId: null,
      metadata: {},
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })),
    getByExternalId: vi.fn(),
    listRecent: vi.fn(),
    countByStatus: vi.fn(),
  }) satisfies EmailStatusRepository;

const loadGateway = async () => import('./email-gateway-resend');

describe('EmailGatewayResend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(testState.emailConfig, {
      resendApiKey: 're_test',
      resendWebhookSecret: 'whsec_test',
      from: 'Start UI <noreply@example.com>',
      deliveryDisabled: false,
    });
    Object.assign(testState.envClient, {
      VITE_IS_DEMO: false,
    });
    testState.render.mockResolvedValue('Plain text login code');
  });

  it('skips sending in demo mode without recording status', async () => {
    testState.envClient.VITE_IS_DEMO = true;
    const statusRepository = makeStatusRepository();
    const resend = { emails: { send: vi.fn() } } as unknown as Resend;
    const { EmailGatewayResend } = await loadGateway();

    const result = await new EmailGatewayResend({
      statusRepository,
      resend,
    }).sendEmail({
      to: 'user@example.com',
      subject: 'Login code',
      template: createElement('div', null, '123456'),
      idempotencyKey: 'key-1',
    });

    expect(result).toEqual({ provider: 'resend', skipped: true });
    expect(statusRepository.recordSendAttempt).not.toHaveBeenCalled();
    expect(resend.emails.send).not.toHaveBeenCalled();
  });

  it('skips sending when delivery is disabled without recording status', async () => {
    testState.emailConfig.deliveryDisabled = true;
    const statusRepository = makeStatusRepository();
    const resend = { emails: { send: vi.fn() } } as unknown as Resend;
    const { EmailGatewayResend } = await loadGateway();

    const result = await new EmailGatewayResend({
      statusRepository,
      resend,
    }).sendEmail({
      to: 'user@example.com',
      subject: 'Login code',
      template: createElement('div', null, '123456'),
      idempotencyKey: 'key-1',
    });

    expect(result).toEqual({ provider: 'resend', skipped: true });
    expect(statusRepository.recordSendAttempt).not.toHaveBeenCalled();
    expect(resend.emails.send).not.toHaveBeenCalled();
  });

  it('renders text fallback, sends the idempotency key, and records sent status', async () => {
    const template = createElement('div', null, '123456');
    const statusRepository = makeStatusRepository();
    const resend = {
      emails: {
        send: vi.fn(async () => ({
          data: { id: 'email_123' },
          error: null,
          headers: null,
        })),
      },
    } as unknown as Resend;
    const { EmailGatewayResend } = await loadGateway();

    await expect(
      new EmailGatewayResend({ statusRepository, resend }).sendEmail({
        to: 'user@example.com',
        subject: 'Login code',
        template,
        idempotencyKey: 'key-1',
        metadata: { source: 'test' },
      })
    ).resolves.toEqual({
      provider: 'resend',
      externalId: 'email_123',
      skipped: false,
    });

    expect(testState.render).toHaveBeenCalledWith(template, {
      plainText: true,
    });
    expect(statusRepository.recordSendAttempt).toHaveBeenCalledWith({
      provider: 'resend',
      recipient: 'user@example.com',
      subject: 'Login code',
      idempotencyKey: 'key-1',
      metadata: { source: 'test' },
    });
    expect(resend.emails.send).toHaveBeenCalledWith(
      {
        from: 'Start UI <noreply@example.com>',
        to: 'user@example.com',
        subject: 'Login code',
        react: template,
        text: 'Plain text login code',
      },
      { idempotencyKey: 'key-1' }
    );
    expect(statusRepository.upsertStatusByExternalId).toHaveBeenCalledWith({
      provider: 'resend',
      externalId: 'email_123',
      recipient: 'user@example.com',
      subject: 'Login code',
      status: 'sent',
      idempotencyKey: 'key-1',
      metadata: { source: 'test' },
    });
  });

  it('short-circuits duplicate sends when the idempotency key already has an external ID', async () => {
    const statusRepository = makeStatusRepository();
    vi.mocked(statusRepository.recordSendAttempt).mockResolvedValueOnce({
      id: 'status-1',
      provider: 'resend',
      externalId: 'email_existing',
      recipient: 'user@example.com',
      subject: 'Login code',
      status: 'sent',
      idempotencyKey: 'key-1',
      lastWebhookEventId: null,
      metadata: {},
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    const resend = {
      emails: {
        send: vi.fn(),
      },
    } as unknown as Resend;
    const { EmailGatewayResend } = await loadGateway();

    await expect(
      new EmailGatewayResend({ statusRepository, resend }).sendEmail({
        to: 'user@example.com',
        subject: 'Login code',
        template: createElement('div', null, '123456'),
        idempotencyKey: 'key-1',
      })
    ).resolves.toEqual({
      provider: 'resend',
      externalId: 'email_existing',
      skipped: false,
    });

    expect(testState.render).not.toHaveBeenCalled();
    expect(resend.emails.send).not.toHaveBeenCalled();
    expect(statusRepository.upsertStatusByExternalId).not.toHaveBeenCalled();
  });

  it('records send_failed status and throws AppError when Resend rejects the send', async () => {
    const statusRepository = makeStatusRepository();
    const resend = {
      emails: {
        send: vi.fn(async () => ({
          data: null,
          error: {
            message: 'Invalid API key',
            name: 'invalid_api_key',
            statusCode: 401,
          },
          headers: null,
        })),
      },
    } as unknown as Resend;
    const { EmailGatewayResend } = await loadGateway();

    await expect(
      new EmailGatewayResend({ statusRepository, resend }).sendEmail({
        to: 'user@example.com',
        subject: 'Login code',
        template: createElement('div', null, '123456'),
        idempotencyKey: 'key-1',
      })
    ).rejects.toMatchObject({
      code: 'EMAIL_SEND_FAILED',
      status: 401,
      details: {
        provider: 'resend',
        errorName: 'invalid_api_key',
        statusCode: 401,
      },
    });

    expect(statusRepository.recordSendAttempt).toHaveBeenLastCalledWith({
      provider: 'resend',
      recipient: 'user@example.com',
      subject: 'Login code',
      idempotencyKey: 'key-1',
      status: 'send_failed',
      metadata: {
        providerError: {
          name: 'invalid_api_key',
          statusCode: 401,
          message: 'Invalid API key',
        },
      },
    });
  });
});
