import type { ApplicationResult } from '@/modules/kernel/application/result';
import type { SessionId, UserId } from '@/modules/kernel/domain/ids';

export type UserAuthRemoveOutcome = { type: 'user_auth_removed' };

export type UserAuthRevokeSessionsOutcome = {
  type: 'user_auth_sessions_revoked';
};

export type UserAuthRevokeSessionOutcome = {
  type: 'user_auth_session_revoked';
};

export interface UserAuthGateway {
  removeUser(userId: UserId): Promise<ApplicationResult<UserAuthRemoveOutcome>>;
  revokeUserSessions(
    userId: UserId
  ): Promise<ApplicationResult<UserAuthRevokeSessionsOutcome>>;
  revokeUserSession(input: {
    userId: UserId;
    sessionId: SessionId;
  }): Promise<ApplicationResult<UserAuthRevokeSessionOutcome>>;
}
