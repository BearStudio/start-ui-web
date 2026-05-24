import { checkPermission } from './application/use-cases/check-permission';
import { getCurrentSession } from './application/use-cases/get-current-session';
import { removeUser } from './application/use-cases/remove-user';
import {
  revokeUserSession,
  revokeUserSessions,
} from './application/use-cases/revoke-user-sessions';
import { sendSignInOtp } from './application/use-cases/send-sign-in-otp';
import type { AuthUseCaseDeps } from './application/use-cases/types';

export function createAuthUseCases(deps: AuthUseCaseDeps) {
  return {
    getCurrentSession: (input: Parameters<typeof getCurrentSession>[1]) =>
      getCurrentSession(deps, input),
    checkPermission: (input: Parameters<typeof checkPermission>[1]) =>
      checkPermission(deps, input),
    sendSignInOtp: (input: Parameters<typeof sendSignInOtp>[1]) =>
      sendSignInOtp(deps, input),
    removeUser: (input: Parameters<typeof removeUser>[1]) =>
      removeUser(deps, input),
    revokeUserSessions: (input: Parameters<typeof revokeUserSessions>[1]) =>
      revokeUserSessions(deps, input),
    revokeUserSession: (input: Parameters<typeof revokeUserSession>[1]) =>
      revokeUserSession(deps, input),
  };
}

export type AuthUseCases = ReturnType<typeof createAuthUseCases>;
