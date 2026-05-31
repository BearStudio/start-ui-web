import type { EmailUseCaseDeps } from './types';
import {
  type EmailMetadata,
  type EmailProvider,
  type EmailStatus,
  type EmailStatusRecord,
  hasProcessedWebhookEvent,
  withProcessedWebhookEventId,
} from '../../domain/email-status';

export type ProcessEmailStatusEventInput = {
  provider: EmailProvider;
  externalId: string;
  recipient: string;
  subject: string;
  status: EmailStatus;
  webhookEventId: string;
  providerEventType: string;
  providerEventCreatedAt: string;
  metadata?: EmailMetadata;
};

export type ProcessEmailStatusEventResult = {
  duplicate: boolean;
  record: EmailStatusRecord;
};

export async function processEmailStatusEvent(
  deps: EmailUseCaseDeps,
  input: ProcessEmailStatusEventInput
): Promise<ProcessEmailStatusEventResult> {
  return deps.transactionRunner.run(async ({ emailStatusRepository }) => {
    const existing = await emailStatusRepository.getByExternalId(
      input.provider,
      input.externalId
    );

    if (existing && hasProcessedWebhookEvent(existing, input.webhookEventId)) {
      return {
        duplicate: true,
        record: existing,
      };
    }

    const metadata = withProcessedWebhookEventId(
      {
        ...existing?.metadata,
        ...input.metadata,
        providerEventType: input.providerEventType,
        providerEventCreatedAt: input.providerEventCreatedAt,
      },
      input.webhookEventId
    );

    const record = await emailStatusRepository.upsertStatusByExternalId({
      provider: input.provider,
      externalId: input.externalId,
      recipient: input.recipient,
      subject: input.subject,
      status: input.status,
      idempotencyKey: existing?.idempotencyKey ?? null,
      lastWebhookEventId: input.webhookEventId,
      metadata,
    });

    return {
      duplicate: false,
      record,
    };
  });
}
