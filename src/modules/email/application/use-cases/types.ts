import type { TransactionRunner } from '@/modules/kernel';

import type { EmailStatusRepository } from '../ports/email-status-repository';

export type EmailTransactionContext = {
  emailStatusRepository: EmailStatusRepository;
};

export type EmailUseCaseDeps = {
  emailStatusRepository: EmailStatusRepository;
  transactionRunner: TransactionRunner<EmailTransactionContext>;
};
