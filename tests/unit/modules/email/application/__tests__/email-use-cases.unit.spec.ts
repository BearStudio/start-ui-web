import { Result } from '@swan-io/boxed';
import { describe, expect, it, vi } from 'vitest';

import type { EmailStatusRepository } from '@/modules/email/application/ports/email-status-repository';
import type { EmailUseCaseDeps } from '@/modules/email/application/use-cases/types';
import {
  EMAIL_PROVIDER_RESEND,
  type EmailStatusRecord,
} from '@/modules/email/domain/email-status';
import { createEmailUseCases } from '@/modules/email/factory';
import {
  toEmailIdempotencyKey,
  toEmailProviderMessageId,
  toEmailRecipientList,
  toEmailStatusId,
  toEmailWebhookEventId,
} from '@/modules/kernel/domain/ids';
import type { ApplicationResult } from '@/modules/kernel/testing';

const now = new Date('2026-01-01T00:00:00.000Z');
const statusId = toEmailStatusId('email-status-1');
const externalId = toEmailProviderMessageId('email_123');
const recipient = toEmailRecipientList('user@example.com');
const webhookEventId = toEmailWebhookEventId('evt_1');
const nextWebhookEventId = toEmailWebhookEventId('evt_2');
const sendIdempotencyKey = toEmailIdempotencyKey('send-key-1');
const input = {
  provider: EMAIL_PROVIDER_RESEND,
  externalId,
  recipient,
  subject: 'Login code',
  status: 'delivered' as const,
  webhookEventId,
  providerEventType: 'email.delivered',
  providerEventCreatedAt: '2026-01-01T00:00:00.000Z',
  metadata: { source: 'webhook' },
};

function makeRecord(
  overrides: Partial<EmailStatusRecord> = {}
): EmailStatusRecord {
  return {
    id: statusId,
    provider: EMAIL_PROVIDER_RESEND,
    externalId,
    recipient,
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
      async () =>
        Result.Ok({ type: 'email_status_recorded', record: makeRecord() })
    ),
    upsertStatusByExternalId: vi.fn<
      EmailStatusRepository['upsertStatusByExternalId']
    >(async (statusInput) =>
      Result.Ok({
        type: 'email_status_recorded',
        record: makeRecord({
          provider: statusInput.provider,
          externalId: statusInput.externalId,
          recipient: statusInput.recipient,
          subject: statusInput.subject,
          status: statusInput.status,
          idempotencyKey: statusInput.idempotencyKey ?? null,
          lastWebhookEventId: statusInput.lastWebhookEventId ?? null,
          metadata: statusInput.metadata ?? {},
        }),
      })
    ),
    getByExternalId: vi.fn<EmailStatusRepository['getByExternalId']>(async () =>
      Result.Ok({ type: 'email_status_not_found' })
    ),
    listRecent: vi.fn<EmailStatusRepository['listRecent']>(async () =>
      Result.Ok({ type: 'email_status_recent_listed', records: [] })
    ),
    countByStatus: vi.fn<EmailStatusRepository['countByStatus']>(async () =>
      Result.Ok({ type: 'email_status_counted', counts: {} })
    ),
  };

  return Object.assign(repository, overrides);
}

function getOk<TOutcome extends { type: string }>(
  result: ApplicationResult<TOutcome>
) {
  if (result.isError()) throw result.getError();
  return result.get();
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

    const processed = await useCases.processStatusEvent(input);

    expect(getOk(processed)).toMatchObject({
      type: 'email_status_event_processed',
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
      externalId
    );
    expect(repository.upsertStatusByExternalId).toHaveBeenCalledWith({
      provider: EMAIL_PROVIDER_RESEND,
      externalId,
      recipient,
      subject: 'Login code',
      status: 'delivered',
      idempotencyKey: null,
      lastWebhookEventId: webhookEventId,
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
      lastWebhookEventId: webhookEventId,
      metadata: { processedWebhookEventIds: ['evt_1'] },
    });
    const repository = makeRepository({
      getByExternalId: vi.fn<EmailStatusRepository['getByExternalId']>(
        async () => Result.Ok({ type: 'email_status_found', record: existing })
      ),
    });
    const useCases = createEmailUseCases(makeDeps(repository));

    const duplicate = await useCases.processStatusEvent(input);

    expect(getOk(duplicate)).toEqual({
      type: 'email_status_event_duplicate',
      record: existing,
    });

    expect(repository.upsertStatusByExternalId).not.toHaveBeenCalled();
  });

  it('merges existing metadata, event metadata, and send idempotency', async () => {
    const existing = makeRecord({
      idempotencyKey: sendIdempotencyKey,
      lastWebhookEventId: webhookEventId,
      metadata: {
        source: 'send',
        keep: true,
        processedWebhookEventIds: ['evt_1'],
      },
    });
    const repository = makeRepository({
      getByExternalId: vi.fn<EmailStatusRepository['getByExternalId']>(
        async () => Result.Ok({ type: 'email_status_found', record: existing })
      ),
    });
    const useCases = createEmailUseCases(makeDeps(repository));

    const processed = await useCases.processStatusEvent({
      ...input,
      status: 'opened',
      webhookEventId: nextWebhookEventId,
      providerEventType: 'email.opened',
      metadata: { source: 'webhook', attempt: 2 },
    });

    expect(getOk(processed)).toMatchObject({
      type: 'email_status_event_processed',
    });

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
