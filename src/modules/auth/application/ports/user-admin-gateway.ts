import type { SessionId, UserId } from '@/modules/kernel/domain/ids';

export interface UserAdminGateway {
  removeUser(input: { userId: UserId; headers: Headers }): Promise<boolean>;
  revokeUserSessions(input: {
    userId: UserId;
    headers: Headers;
  }): Promise<boolean>;
  revokeUserSession(input: {
    userId: UserId;
    sessionId: SessionId;
    headers: Headers;
  }): Promise<boolean>;
}
