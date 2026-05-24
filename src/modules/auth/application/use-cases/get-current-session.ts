import type { AuthSession } from '../../domain/session';
import type { AuthUseCaseDeps } from './types';

export async function getCurrentSession(
  deps: AuthUseCaseDeps,
  input: { headers: Headers }
): Promise<AuthSession | null> {
  return deps.sessionGateway.getSession(input);
}
