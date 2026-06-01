import type { ApplicationResult } from '@/modules/kernel/application/result';

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

export type EmailStatusRecordRepositoryOutcome = {
  type: 'email_status_recorded';
  record: EmailStatusRecord;
};

export type EmailStatusGetRepositoryOutcome =
  | { type: 'email_status_found'; record: EmailStatusRecord }
  | { type: 'email_status_not_found' };

export type EmailStatusListRecentRepositoryOutcome = {
  type: 'email_status_recent_listed';
  records: EmailStatusRecord[];
};

export type EmailStatusCountRepositoryOutcome = {
  type: 'email_status_counted';
  counts: Partial<Record<EmailStatus, number>>;
};

export interface EmailStatusRepository {
  recordSendAttempt(
    input: RecordEmailSendAttemptInput
  ): Promise<ApplicationResult<EmailStatusRecordRepositoryOutcome>>;
  upsertStatusByExternalId(
    input: UpsertEmailStatusInput
  ): Promise<ApplicationResult<EmailStatusRecordRepositoryOutcome>>;
  getByExternalId(
    provider: EmailProvider,
    externalId: string
  ): Promise<ApplicationResult<EmailStatusGetRepositoryOutcome>>;
  listRecent(input?: {
    limit?: number;
  }): Promise<ApplicationResult<EmailStatusListRecentRepositoryOutcome>>;
  countByStatus(): Promise<
    ApplicationResult<EmailStatusCountRepositoryOutcome>
  >;
}
