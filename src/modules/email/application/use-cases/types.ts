import type { EmailStatusRepository } from '../ports/email-status-repository';

export type EmailUseCaseDeps = {
  emailStatusRepository: EmailStatusRepository;
};
