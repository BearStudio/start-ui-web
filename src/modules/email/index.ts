export type {
  EmailGateway,
  SendEmailOutcome,
  SendEmailParams,
} from './application/ports/email-gateway';
export type {
  EmailStatusRepository,
  RecordEmailSendAttemptInput,
  UpsertEmailStatusInput,
} from './application/ports/email-status-repository';
export type { EmailTransactionContext } from './application/use-cases/types';
export {
  EMAIL_PROVIDER_RESEND,
  type EmailMetadata,
  type EmailProvider,
  type EmailStatus,
  type EmailStatusRecord,
  emailStatusValues,
  hasProcessedWebhookEvent,
  withProcessedWebhookEventId,
} from './domain/email-status';
export { createEmailUseCases, type EmailUseCases } from './factory';
