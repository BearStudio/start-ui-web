import type { SessionId, UserId } from '@/modules/kernel/domain/ids';

export interface UserAuthGateway {
  removeUser(userId: UserId): Promise<boolean>;
  revokeUserSessions(userId: UserId): Promise<boolean>;
  revokeUserSession(input: {
    userId: UserId;
    sessionId: SessionId;
  }): Promise<boolean>;
}
