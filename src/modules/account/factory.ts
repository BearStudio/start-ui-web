import { submitOnboarding } from './application/use-cases/submit-onboarding';
import type { AccountUseCaseDeps } from './application/use-cases/types';
import { updateAccountInfo } from './application/use-cases/update-account-info';

export function createAccountUseCases(deps: AccountUseCaseDeps) {
  return {
    submitOnboarding: (input: Parameters<typeof submitOnboarding>[1]) =>
      submitOnboarding(deps, input),
    updateInfo: (input: Parameters<typeof updateAccountInfo>[1]) =>
      updateAccountInfo(deps, input),
  };
}

export type AccountUseCases = ReturnType<typeof createAccountUseCases>;
