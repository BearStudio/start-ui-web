import type { AuthUseCaseDeps } from './types';

export async function revokeUserSessions(
  deps: AuthUseCaseDeps,
  input: { userId: string; headers: Headers }
): Promise<boolean> {
  return deps.userAdminGateway.revokeUserSessions(input);
}
