import type { AuthUseCaseDeps } from './types';

export async function revokeUserSessions(
  deps: AuthUseCaseDeps,
  input: { userId: string; headers: Headers }
): Promise<boolean> {
  return deps.userAdminGateway.revokeUserSessions(input);
}

export async function revokeUserSession(
  deps: AuthUseCaseDeps,
  input: {
    sessionId: string;
    providerSessionToken: string;
    headers: Headers;
  }
): Promise<boolean> {
  return deps.userAdminGateway.revokeUserSession(input);
}
