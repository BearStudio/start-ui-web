import type { AuthUseCaseDeps } from './types';
import type { AuthSession } from '../../domain/session';

export async function getCurrentSession(
  deps: AuthUseCaseDeps,
  input: { headers: Headers }
): Promise<AuthSession | null> {
  return deps.sessionGateway.getSession(input);
}
