import { describe, expect, it, vi } from 'vitest';

import type { EmailStatusRepository } from '@/modules/email/application/ports/email-status-repository';
import type { EmailUseCaseDeps } from '@/modules/email/application/use-cases/types';
import {
  EMAIL_PROVIDER_RESEND,
  type EmailStatusRecord,
} from '@/modules/email/domain/email-status';
import { createEmailUseCases } from '@/modules/email/factory';

const now = new Date('2026-01-01T00:00:00.000Z');
const input = {
  provider: EMAIL_PROVIDER_RESEND,
  externalId: 'email_123',
  recipient: 'user@example.com',
  subject: 'Login code',
  status: 'delivered' as const,
  webhookEventId: 'evt_1',
  providerEventType: 'email.delivered',
  providerEventCreatedAt: '2026-01-01T00:00:00.000Z',
  metadata: { source: 'webhook' },
};

function makeRecord(
  overrides: Partial<EmailStatusRecord> = {}
): EmailStatusRecord {
  return {
    id: 'email-status-1',
    provider: EMAIL_PROVIDER_RESEND,
    externalId: 'email_123',
    recipient: 'user@example.com',
    subject: 'Login code',
    status: 'sent',
    idempotencyKey: null,
    lastWebhookEventId: null,
    metadata: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeRepository(overrides: Partial<EmailStatusRepository> = {}) {
  const repository = {
    recordSendAttempt: vi.fn<EmailStatusRepository['recordSendAttempt']>(
      async () => makeRecord()
    ),
    upsertStatusByExternalId: vi.fn<
      EmailStatusRepository['upsertStatusByExternalId']
    >(async (statusInput) =>
      makeRecord({
        provider: statusInput.provider,
        externalId: statusInput.externalId,
        recipient: statusInput.recipient,
        subject: statusInput.subject,
        status: statusInput.status,
        idempotencyKey: statusInput.idempotencyKey ?? null,
        lastWebhookEventId: statusInput.lastWebhookEventId ?? null,
        metadata: statusInput.metadata ?? {},
      })
    ),
    getByExternalId: vi.fn<EmailStatusRepository['getByExternalId']>(
      async () => null
    ),
    listRecent: vi.fn<EmailStatusRepository['listRecent']>(async () => []),
    countByStatus: vi.fn<EmailStatusRepository['countByStatus']>(
      async () => ({})
    ),
  };

  return Object.assign(repository, overrides);
}

function makeDeps(
  repository: EmailStatusRepository,
  onTransactionRun?: () => void
): EmailUseCaseDeps {
  return {
    emailStatusRepository: repository,
    transactionRunner: {
      run: (work) => {
        onTransactionRun?.();
        return work({ emailStatusRepository: repository });
      },
    },
  };
}

describe('email use cases', () => {
  it('upserts new webhook status events without DB or provider clients', async () => {
    const repository = makeRepository();
    const transactionRun = vi.fn();
    const useCases = createEmailUseCases(makeDeps(repository, transactionRun));

    await expect(useCases.processStatusEvent(input)).resolves.toMatchObject({
      duplicate: false,
      record: {
        externalId: 'email_123',
        status: 'delivered',
        lastWebhookEventId: 'evt_1',
        metadata: {
          source: 'webhook',
          providerEventType: 'email.delivered',
          providerEventCreatedAt: '2026-01-01T00:00:00.000Z',
          processedWebhookEventIds: ['evt_1'],
        },
      },
    });

    expect(repository.getByExternalId).toHaveBeenCalledWith(
      EMAIL_PROVIDER_RESEND,
      'email_123'
    );
    expect(repository.upsertStatusByExternalId).toHaveBeenCalledWith({
      provider: EMAIL_PROVIDER_RESEND,
      externalId: 'email_123',
      recipient: 'user@example.com',
      subject: 'Login code',
      status: 'delivered',
      idempotencyKey: null,
      lastWebhookEventId: 'evt_1',
      metadata: {
        source: 'webhook',
        providerEventType: 'email.delivered',
        providerEventCreatedAt: '2026-01-01T00:00:00.000Z',
        processedWebhookEventIds: ['evt_1'],
      },
    });
    expect(transactionRun).toHaveBeenCalledTimes(1);
  });

  it('returns duplicate results without writing when a webhook event was processed', async () => {
    const existing = makeRecord({
      status: 'delivered',
      lastWebhookEventId: 'evt_1',
      metadata: { processedWebhookEventIds: ['evt_1'] },
    });
    const repository = makeRepository({
      getByExternalId: vi.fn<EmailStatusRepository['getByExternalId']>(
        async () => existing
      ),
    });
    const useCases = createEmailUseCases(makeDeps(repository));

    await expect(useCases.processStatusEvent(input)).resolves.toEqual({
      duplicate: true,
      record: existing,
    });

    expect(repository.upsertStatusByExternalId).not.toHaveBeenCalled();
  });

  it('merges existing metadata, event metadata, and send idempotency', async () => {
    const existing = makeRecord({
      idempotencyKey: 'send-key-1',
      lastWebhookEventId: 'evt_1',
      metadata: {
        source: 'send',
        keep: true,
        processedWebhookEventIds: ['evt_1'],
      },
    });
    const repository = makeRepository({
      getByExternalId: vi.fn<EmailStatusRepository['getByExternalId']>(
        async () => existing
      ),
    });
    const useCases = createEmailUseCases(makeDeps(repository));

    await expect(
      useCases.processStatusEvent({
        ...input,
        status: 'opened',
        webhookEventId: 'evt_2',
        providerEventType: 'email.opened',
        metadata: { source: 'webhook', attempt: 2 },
      })
    ).resolves.toMatchObject({ duplicate: false });

    expect(repository.upsertStatusByExternalId).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'opened',
        idempotencyKey: 'send-key-1',
        lastWebhookEventId: 'evt_2',
        metadata: {
          source: 'webhook',
          keep: true,
          attempt: 2,
          providerEventType: 'email.opened',
          providerEventCreatedAt: '2026-01-01T00:00:00.000Z',
          processedWebhookEventIds: ['evt_1', 'evt_2'],
        },
      })
    );
  });
});
