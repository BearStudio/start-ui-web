import type { SessionId, UserId } from '@/modules/kernel/domain/ids';

import type { AuthUseCaseDeps } from './types';

export async function revokeUserSession(
  deps: AuthUseCaseDeps,
  input: {
    userId: UserId;
    sessionId: SessionId;
    headers: Headers;
  }
): Promise<boolean> {
  return deps.userAdminGateway.revokeUserSession(input);
}
