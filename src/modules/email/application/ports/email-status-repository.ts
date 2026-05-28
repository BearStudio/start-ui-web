import type {
  EmailMetadata,
  EmailProvider,
  EmailStatus,
  EmailStatusRecord,
} from '../../domain/email-status';

export type RecordEmailSendAttemptInput = {
  provider: EmailProvider;
  recipient: string;
  subject: string;
  idempotencyKey: string;
  status?: Extract<EmailStatus, 'send_attempted' | 'send_failed'>;
  metadata?: EmailMetadata;
};

export type UpsertEmailStatusInput = {
  provider: EmailProvider;
  externalId: string;
  recipient: string;
  subject: string;
  status: EmailStatus;
  idempotencyKey?: string | null;
  lastWebhookEventId?: string | null;
  metadata?: EmailMetadata;
};

export interface EmailStatusRepository {
  recordSendAttempt(
    input: RecordEmailSendAttemptInput
  ): Promise<EmailStatusRecord>;
  upsertStatusByExternalId(
    input: UpsertEmailStatusInput
  ): Promise<EmailStatusRecord>;
  getByExternalId(
    provider: EmailProvider,
    externalId: string
  ): Promise<EmailStatusRecord | null>;
  listRecent(input?: { limit?: number }): Promise<EmailStatusRecord[]>;
  countByStatus(): Promise<Partial<Record<EmailStatus, number>>>;
}
