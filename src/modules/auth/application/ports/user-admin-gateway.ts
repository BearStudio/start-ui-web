export interface UserAdminGateway {
  removeUser(input: { userId: string; headers: Headers }): Promise<boolean>;
  revokeUserSessions(input: {
    userId: string;
    headers: Headers;
  }): Promise<boolean>;
  revokeUserSession(input: {
    sessionId: string;
    providerSessionToken: string;
    headers: Headers;
  }): Promise<boolean>;
}
