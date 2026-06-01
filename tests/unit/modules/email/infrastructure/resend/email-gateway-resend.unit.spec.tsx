import { createElement } from 'react';
import { Result } from '@swan-io/boxed';
import type { Resend } from 'resend';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  EmailStatusRecord,
  EmailStatusRepository,
  EmailTransactionContext,
} from '@/modules/email';
import type { ApplicationResult, TransactionRunner } from '@/modules/kernel';

const testState = vi.hoisted(() => ({
  emailConfig: {
    resendApiKey: 'resend_api_key_placeholder', // pragma: allowlist secret
    resendWebhookSecret: 'resend_webhook_secret_placeholder', // pragma: allowlist secret
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

const makeEmailStatusRecord = (
  overrides: Partial<EmailStatusRecord> = {}
): EmailStatusRecord => ({
  id: 'status-1',
  provider: 'resend',
  externalId: null,
  recipient: 'user@example.com',
  subject: 'Login code',
  status: 'send_attempted',
  idempotencyKey: 'key-1',
  lastWebhookEventId: null,
  metadata: {},
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

const makeStatusRepository = (): EmailStatusRepository =>
  ({
    recordSendAttempt: vi.fn(async () =>
      Result.Ok({
        type: 'email_status_recorded' as const,
        record: makeEmailStatusRecord(),
      })
    ),
    upsertStatusByExternalId: vi.fn(async () =>
      Result.Ok({
        type: 'email_status_recorded' as const,
        record: makeEmailStatusRecord({
          externalId: 'email_123',
          status: 'sent',
        }),
      })
    ),
    getByExternalId: vi.fn(),
    listRecent: vi.fn(),
    countByStatus: vi.fn(),
  }) satisfies EmailStatusRepository;

const makeStatusTransactionRunner = (
  emailStatusRepository: EmailStatusRepository,
  onRun?: () => void
): TransactionRunner<EmailTransactionContext> => ({
  run: (work) => {
    onRun?.();
    return work({ emailStatusRepository });
  },
});

const loadGateway = async () =>
  import('@/modules/email/infrastructure/resend/email-gateway-resend');

function getOk<TOutcome extends { type: string }>(
  result: ApplicationResult<TOutcome>
) {
  if (result.isError()) throw result.getError();
  return result.get();
}

function getError<TOutcome extends { type: string }>(
  result: ApplicationResult<TOutcome>
) {
  if (result.isOk()) {
    throw new Error(`Expected Result.Error, got ${result.get().type}`);
  }
  return result.getError();
}

describe('EmailGatewayResend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(testState.emailConfig, {
      resendApiKey: 'resend_api_key_placeholder', // pragma: allowlist secret
      resendWebhookSecret: 'resend_webhook_secret_placeholder', // pragma: allowlist secret
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
      statusTransactionRunner: makeStatusTransactionRunner(statusRepository),
      resend,
    }).sendEmail({
      to: 'user@example.com',
      subject: 'Login code',
      template: createElement('div', null, '123456'),
      idempotencyKey: 'key-1',
    });

    expect(getOk(result)).toEqual({
      type: 'email_send_skipped',
      provider: 'resend',
    });
    expect(statusRepository.recordSendAttempt).not.toHaveBeenCalled();
    expect(resend.emails.send).not.toHaveBeenCalled();
  });

  it('skips sending when delivery is disabled without recording status', async () => {
    testState.emailConfig.deliveryDisabled = true;
    const statusRepository = makeStatusRepository();
    const resend = { emails: { send: vi.fn() } } as unknown as Resend;
    const { EmailGatewayResend } = await loadGateway();

    const result = await new EmailGatewayResend({
      statusTransactionRunner: makeStatusTransactionRunner(statusRepository),
      resend,
    }).sendEmail({
      to: 'user@example.com',
      subject: 'Login code',
      template: createElement('div', null, '123456'),
      idempotencyKey: 'key-1',
    });

    expect(getOk(result)).toEqual({
      type: 'email_send_skipped',
      provider: 'resend',
    });
    expect(statusRepository.recordSendAttempt).not.toHaveBeenCalled();
    expect(resend.emails.send).not.toHaveBeenCalled();
  });

  it('renders text fallback, sends the idempotency key, and records sent status', async () => {
    const template = createElement('div', null, '123456');
    const statusRepository = makeStatusRepository();
    const transactionRun = vi.fn();
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

    const result = await new EmailGatewayResend({
      statusTransactionRunner: makeStatusTransactionRunner(
        statusRepository,
        transactionRun
      ),
      resend,
    }).sendEmail({
      to: 'user@example.com',
      subject: 'Login code',
      template,
      idempotencyKey: 'key-1',
      metadata: { source: 'test' },
    });

    expect(getOk(result)).toEqual({
      type: 'email_send_recorded',
      provider: 'resend',
      externalId: 'email_123',
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
    expect(transactionRun).toHaveBeenCalledTimes(2);
  });

  it('short-circuits duplicate sends when the idempotency key already has an external ID', async () => {
    const statusRepository = makeStatusRepository();
    vi.mocked(statusRepository.recordSendAttempt).mockResolvedValueOnce(
      Result.Ok({
        type: 'email_status_recorded' as const,
        record: makeEmailStatusRecord({
          externalId: 'email_existing',
          status: 'sent',
        }),
      })
    );
    const resend = {
      emails: {
        send: vi.fn(),
      },
    } as unknown as Resend;
    const { EmailGatewayResend } = await loadGateway();

    const result = await new EmailGatewayResend({
      statusTransactionRunner: makeStatusTransactionRunner(statusRepository),
      resend,
    }).sendEmail({
      to: 'user@example.com',
      subject: 'Login code',
      template: createElement('div', null, '123456'),
      idempotencyKey: 'key-1',
    });

    expect(getOk(result)).toEqual({
      type: 'email_send_recorded',
      provider: 'resend',
      externalId: 'email_existing',
    });

    expect(testState.render).not.toHaveBeenCalled();
    expect(resend.emails.send).not.toHaveBeenCalled();
    expect(statusRepository.upsertStatusByExternalId).not.toHaveBeenCalled();
  });

  it('records send_failed status and returns AppError when Resend rejects the send', async () => {
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

    const result = await new EmailGatewayResend({
      statusTransactionRunner: makeStatusTransactionRunner(statusRepository),
      resend,
    }).sendEmail({
      to: 'user@example.com',
      subject: 'Login code',
      template: createElement('div', null, '123456'),
      idempotencyKey: 'key-1',
    });

    expect(getError(result)).toMatchObject({
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

  it('returns an existing external ID if a failed send races with a completed attempt', async () => {
    const statusRepository = makeStatusRepository();
    vi.mocked(statusRepository.recordSendAttempt)
      .mockResolvedValueOnce(
        Result.Ok({
          type: 'email_status_recorded' as const,
          record: makeEmailStatusRecord(),
        })
      )
      .mockResolvedValueOnce(
        Result.Ok({
          type: 'email_status_recorded' as const,
          record: makeEmailStatusRecord({
            externalId: 'email_existing',
            status: 'sent',
          }),
        })
      );
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

    const result = await new EmailGatewayResend({
      statusTransactionRunner: makeStatusTransactionRunner(statusRepository),
      resend,
    }).sendEmail({
      to: 'user@example.com',
      subject: 'Login code',
      template: createElement('div', null, '123456'),
      idempotencyKey: 'key-1',
    });

    expect(getOk(result)).toEqual({
      type: 'email_send_recorded',
      provider: 'resend',
      externalId: 'email_existing',
    });
  });

  it('returns an existing external ID if an empty provider result races with a completed attempt', async () => {
    const statusRepository = makeStatusRepository();
    vi.mocked(statusRepository.recordSendAttempt)
      .mockResolvedValueOnce(
        Result.Ok({
          type: 'email_status_recorded' as const,
          record: makeEmailStatusRecord(),
        })
      )
      .mockResolvedValueOnce(
        Result.Ok({
          type: 'email_status_recorded' as const,
          record: makeEmailStatusRecord({
            externalId: 'email_existing',
            status: 'sent',
          }),
        })
      );
    const resend = {
      emails: {
        send: vi.fn(async () => ({
          data: null,
          error: null,
          headers: null,
        })),
      },
    } as unknown as Resend;
    const { EmailGatewayResend } = await loadGateway();

    const result = await new EmailGatewayResend({
      statusTransactionRunner: makeStatusTransactionRunner(statusRepository),
      resend,
    }).sendEmail({
      to: 'user@example.com',
      subject: 'Login code',
      template: createElement('div', null, '123456'),
      idempotencyKey: 'key-1',
    });

    expect(getOk(result)).toEqual({
      type: 'email_send_recorded',
      provider: 'resend',
      externalId: 'email_existing',
    });
  });
});
