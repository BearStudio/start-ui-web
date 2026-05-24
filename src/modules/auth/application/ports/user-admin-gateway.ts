export interface UserAdminGateway {
  removeUser(input: { userId: string; headers: Headers }): Promise<boolean>;
  revokeUserSessions(input: {
    userId: string;
    headers: Headers;
  }): Promise<boolean>;
  revokeUserSession(input: {
    sessionId: string;
    providerToken: string;
    headers: Headers;
  }): Promise<boolean>;
}
