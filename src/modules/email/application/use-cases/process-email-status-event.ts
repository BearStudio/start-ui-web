import { Result } from '@swan-io/boxed';

import { AppError } from '@/modules/kernel/domain/errors/app-error';

import type {
  EmailResult,
  EmailUseCaseDeps,
  ProcessEmailStatusEventOutcome,
} from './types';
import {
  type EmailMetadata,
  type EmailProvider,
  type EmailStatus,
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

export async function processEmailStatusEvent(
  deps: EmailUseCaseDeps,
  input: ProcessEmailStatusEventInput
): Promise<EmailResult<ProcessEmailStatusEventOutcome>> {
  try {
    return await deps.transactionRunner.run(
      async ({ emailStatusRepository }) => {
        const existingResult = await emailStatusRepository.getByExternalId(
          input.provider,
          input.externalId
        );
        if (existingResult.isError()) {
          return Result.Error(existingResult.getError());
        }

        const existingOutcome = existingResult.get();
        const existing =
          existingOutcome.type === 'email_status_found'
            ? existingOutcome.record
            : undefined;

        if (
          existing &&
          hasProcessedWebhookEvent(existing, input.webhookEventId)
        ) {
          return Result.Ok({
            type: 'email_status_event_duplicate',
            record: existing,
          });
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

        const recordResult =
          await emailStatusRepository.upsertStatusByExternalId({
            provider: input.provider,
            externalId: input.externalId,
            recipient: input.recipient,
            subject: input.subject,
            status: input.status,
            idempotencyKey: existing?.idempotencyKey ?? null,
            lastWebhookEventId: input.webhookEventId,
            metadata,
          });
        if (recordResult.isError())
          return Result.Error(recordResult.getError());

        return Result.Ok({
          type: 'email_status_event_processed',
          record: recordResult.get().record,
        });
      }
    );
  } catch (error) {
    return Result.Error(
      error instanceof AppError
        ? error
        : new AppError({
            code: 'EMAIL_STATUS_TRANSACTION_ERROR',
            category: 'system',
            status: 500,
            message: 'Email status transaction error',
            cause: error,
          })
    );
  }
}
