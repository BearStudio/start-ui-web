import type { ApplicationResult } from '@/modules/kernel/application/result';
import type {
  EmailIdempotencyKey,
  EmailProviderMessageId,
  EmailRecipientList,
} from '@/modules/kernel/domain/ids';

import type { EmailMetadata, EmailProvider } from '../../domain/email-status';

export type EmailRecipient = EmailRecipientList | EmailRecipientList[];

export type EmailTag = {
  name: string;
  value: string;
};

export type SendEmailParams = {
  to: EmailRecipient;
  subject: string;
  template: object;
  idempotencyKey: EmailIdempotencyKey;
  cc?: EmailRecipient;
  bcc?: EmailRecipient;
  replyTo?: EmailRecipient;
  headers?: Record<string, string>;
  attachments?: unknown[];
  tags?: EmailTag[];
  metadata?: EmailMetadata;
};

export type SendEmailOutcome =
  | {
      type: 'email_send_recorded';
      provider: EmailProvider;
      externalId: EmailProviderMessageId;
    }
  | {
      type: 'email_send_skipped';
      provider: EmailProvider;
    };

export interface EmailGateway {
  sendEmail(
    params: SendEmailParams
  ): Promise<ApplicationResult<SendEmailOutcome>>;
}
