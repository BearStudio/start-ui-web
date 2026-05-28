import type { EmailMetadata, EmailProvider } from '../../domain/email-status';

export type EmailRecipient = string | string[];

export type EmailTag = {
  name: string;
  value: string;
};

export type SendEmailParams = {
  to: EmailRecipient;
  subject: string;
  template: object;
  idempotencyKey: string;
  cc?: EmailRecipient;
  bcc?: EmailRecipient;
  replyTo?: EmailRecipient;
  headers?: Record<string, string>;
  attachments?: unknown[];
  tags?: EmailTag[];
  metadata?: EmailMetadata;
};

export type SendEmailResult = {
  provider: EmailProvider;
  externalId?: string;
  skipped: boolean;
};

export interface EmailGateway {
  sendEmail(params: SendEmailParams): Promise<SendEmailResult>;
}
