import type { Role } from './permissions';

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
