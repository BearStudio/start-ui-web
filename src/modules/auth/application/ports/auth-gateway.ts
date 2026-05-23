import type { Permission, Role } from '../../domain/permissions';

export type AuthenticatedUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: boolean;
  role: Role;
  onboardedAt?: Date | string | null;
};

export type AuthenticatedSession = {
  id: string;
  userId?: string;
  expiresAt?: Date | string;
};

export type AuthSession = {
  user: AuthenticatedUser;
  session: AuthenticatedSession;
};

export type AuthGateway = {
  getSession(input: { headers: Headers }): Promise<AuthSession | null>;
  userHasPermission(input: {
    userId: string;
    permissions: Permission;
    headers: Headers;
  }): Promise<boolean>;
  removeUser(input: { userId: string; headers: Headers }): Promise<boolean>;
  revokeUserSessions(input: {
    userId: string;
    headers: Headers;
  }): Promise<boolean>;
  revokeUserSession(input: {
    sessionId: string;
    providerSessionToken?: string;
    headers: Headers;
  }): Promise<boolean>;
};
