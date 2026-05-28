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
  id: string;
  provider: EmailProvider;
  externalId: string | null;
  recipient: string;
  subject: string;
  status: EmailStatus;
  idempotencyKey: string | null;
  lastWebhookEventId: string | null;
  metadata: EmailMetadata;
  createdAt: Date;
  updatedAt: Date;
};

const processedWebhookEventIdsKey = 'processedWebhookEventIds';

const toProcessedWebhookEventIds = (metadata: EmailMetadata): string[] => {
  const value = metadata[processedWebhookEventIdsKey];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
};

export const hasProcessedWebhookEvent = (
  record: EmailStatusRecord,
  eventId: string
) =>
  record.lastWebhookEventId === eventId ||
  toProcessedWebhookEventIds(record.metadata).includes(eventId);

export const withProcessedWebhookEventId = (
  metadata: EmailMetadata,
  eventId: string,
  limit = 20
): EmailMetadata => {
  const ids = toProcessedWebhookEventIds(metadata).filter(
    (id) => id !== eventId
  );
  ids.push(eventId);

  return {
    ...metadata,
    [processedWebhookEventIdsKey]: ids.slice(-limit),
  };
};
