import type { SessionId } from '@/modules/kernel/domain/ids';

import type { AuthUseCaseDeps } from './types';

export async function revokeUserSession(
  deps: AuthUseCaseDeps,
  input: {
    sessionId: SessionId;
    providerToken: string;
    headers: Headers;
  }
): Promise<boolean> {
  return deps.userAdminGateway.revokeUserSession(input);
}
