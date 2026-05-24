import type { AuthUseCaseDeps } from './types';

export async function removeUser(
  deps: AuthUseCaseDeps,
  input: { userId: string; headers: Headers }
): Promise<boolean> {
  return deps.userAdminGateway.removeUser(input);
}
