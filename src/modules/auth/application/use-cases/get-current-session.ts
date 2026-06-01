import type { AuthResult, AuthSessionOutcome, AuthUseCaseDeps } from './types';

export async function getCurrentSession(
  deps: AuthUseCaseDeps,
  input: { headers: Headers }
): Promise<AuthResult<AuthSessionOutcome>> {
  return deps.sessionGateway.getSession(input);
}
