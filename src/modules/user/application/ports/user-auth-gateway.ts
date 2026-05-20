import type { UserId } from '@/modules/kernel/domain/ids';

export interface UserAuthGateway {
  removeUser(userId: UserId): Promise<boolean>;
  revokeUserSessions(userId: UserId): Promise<boolean>;
  revokeUserSession(sessionToken: string): Promise<boolean>;
}
