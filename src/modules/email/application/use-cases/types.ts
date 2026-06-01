import type { ApplicationResult, TransactionRunner } from '@/modules/kernel';

import type { EmailStatusRepository } from '../ports/email-status-repository';
import type { EmailStatusRecord } from '../../domain/email-status';

export type EmailTransactionContext = {
  emailStatusRepository: EmailStatusRepository;
};

export type EmailUseCaseDeps = {
  emailStatusRepository: EmailStatusRepository;
  transactionRunner: TransactionRunner<EmailTransactionContext>;
};

export type ProcessEmailStatusEventOutcome =
  | { type: 'email_status_event_processed'; record: EmailStatusRecord }
  | { type: 'email_status_event_duplicate'; record: EmailStatusRecord };

export type EmailResult<TOutcome> = ApplicationResult<TOutcome>;
