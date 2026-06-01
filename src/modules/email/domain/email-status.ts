import { concat, filter, isString, pipe, takeLast } from 'remeda';

import type {
  EmailIdempotencyKey,
  EmailProviderMessageId,
  EmailRecipientList,
  EmailStatusId,
  EmailWebhookEventId,
} from '@/modules/kernel/domain/ids';

export const EMAIL_PROVIDER_RESEND = 'resend' as const;

export type EmailProvider = typeof EMAIL_PROVIDER_RESEND;

export const emailStatusValues = [
  'send_attempted',
  'send_failed',
  'scheduled',
  'sent',
  'delivered',
  'delivery_delayed',
  'complained',
  'bounced',
  'opened',
  'clicked',
  'received',
  'failed',
  'suppressed',
] as const;

export type EmailStatus = (typeof emailStatusValues)[number];

export type EmailMetadata = Record<string, unknown>;

export type EmailStatusRecord = {
  id: EmailStatusId;
  provider: EmailProvider;
  externalId: EmailProviderMessageId | null;
  recipient: EmailRecipientList;
  subject: string;
  status: EmailStatus;
  idempotencyKey: EmailIdempotencyKey | null;
  lastWebhookEventId: EmailWebhookEventId | null;
  metadata: EmailMetadata;
  createdAt: Date;
  updatedAt: Date;
};

const processedWebhookEventIdsKey = 'processedWebhookEventIds';
const processedWebhookEventIdsDefaultLimit = 20;

const toProcessedWebhookEventIds = (metadata: EmailMetadata): string[] => {
  const value = metadata[processedWebhookEventIdsKey];
  if (!Array.isArray(value)) return [];
  return filter(value, isString);
};

export const hasProcessedWebhookEvent = (
  record: EmailStatusRecord,
  eventId: EmailWebhookEventId
) =>
  record.lastWebhookEventId === eventId ||
  toProcessedWebhookEventIds(record.metadata).includes(eventId);

export const withProcessedWebhookEventId = (
  metadata: EmailMetadata,
  eventId: EmailWebhookEventId,
  limit = processedWebhookEventIdsDefaultLimit
): EmailMetadata => {
  const boundedLimit =
    Number.isFinite(limit) && limit >= 0
      ? Math.trunc(limit)
      : processedWebhookEventIdsDefaultLimit;
  const ids = pipe(
    toProcessedWebhookEventIds(metadata),
    filter((id) => id !== eventId),
    concat([eventId]),
    takeLast(boundedLimit)
  );

  return {
    ...metadata,
    [processedWebhookEventIdsKey]: ids,
  };
};
