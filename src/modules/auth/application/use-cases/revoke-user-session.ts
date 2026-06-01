import type { SessionId, UserId } from '@/modules/kernel/domain/ids';

import type {
  AuthResult,
  AuthRevokeUserSessionOutcome,
  AuthUseCaseDeps,
} from './types';

export async function revokeUserSession(
  deps: AuthUseCaseDeps,
  input: {
    userId: UserId;
    sessionId: SessionId;
    headers: Headers;
  }
): Promise<AuthResult<AuthRevokeUserSessionOutcome>> {
  return deps.userAdminGateway.revokeUserSession(input);
}
