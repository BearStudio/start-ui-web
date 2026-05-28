import {
  processEmailStatusEvent,
  type ProcessEmailStatusEventInput,
} from './application/use-cases/process-email-status-event';
import type { EmailUseCaseDeps } from './application/use-cases/types';

export function createEmailUseCases(deps: EmailUseCaseDeps) {
  return {
    processStatusEvent: (input: ProcessEmailStatusEventInput) =>
      processEmailStatusEvent(deps, input),
  };
}

export type EmailUseCases = ReturnType<typeof createEmailUseCases>;
