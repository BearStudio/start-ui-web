import type { AuthUseCaseDeps } from './types';

export async function revokeUserSession(
  deps: AuthUseCaseDeps,
  input: {
    sessionId: string;
    providerToken: string;
    headers: Headers;
  }
): Promise<boolean> {
  return deps.userAdminGateway.revokeUserSession(input);
}
