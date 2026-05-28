import type { UserId } from '@/modules/kernel/domain/ids';

import type { AuthUseCaseDeps } from './types';

export async function revokeUserSessions(
  deps: AuthUseCaseDeps,
  input: { userId: UserId; headers: Headers }
): Promise<boolean> {
  return deps.userAdminGateway.revokeUserSessions(input);
}
