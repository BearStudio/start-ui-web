import type { ApplicationResult } from '@/modules/kernel/application/result';
import type { SessionId, UserId } from '@/modules/kernel/domain/ids';

export type UserAdminRemoveOutcome = { type: 'auth_user_removed' };

export type UserAdminRevokeSessionsOutcome = {
  type: 'auth_user_sessions_revoked';
};

export type UserAdminRevokeSessionOutcome = {
  type: 'auth_user_session_revoked';
};

export interface UserAdminGateway {
  removeUser(input: {
    userId: UserId;
    headers: Headers;
  }): Promise<ApplicationResult<UserAdminRemoveOutcome>>;
  revokeUserSessions(input: {
    userId: UserId;
    headers: Headers;
  }): Promise<ApplicationResult<UserAdminRevokeSessionsOutcome>>;
  revokeUserSession(input: {
    userId: UserId;
    sessionId: SessionId;
    headers: Headers;
  }): Promise<ApplicationResult<UserAdminRevokeSessionOutcome>>;
}
