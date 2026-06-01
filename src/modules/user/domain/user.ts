import type {
  EmailAddress,
  SessionId,
  UserId,
} from '@/modules/kernel/domain/ids';

export type UserRole = 'admin' | 'user';

export type User = {
  id: UserId;
  name: string | null;
  email: EmailAddress;
  emailVerified: boolean;
  role: UserRole;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  onboardedAt: Date | null;
};

export type UserSession = {
  id: SessionId;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
};

export type UserListPage = {
  items: User[];
  nextCursor?: UserId;
  total: number;
};

export type UserSessionListPage = {
  items: UserSession[];
  nextCursor?: SessionId;
  total: number;
};

export type UserCreateInput = {
  name?: string | null;
  email: EmailAddress;
  role?: UserRole | null;
};

export type UserUpdateInput = {
  name?: string | null;
  email: EmailAddress;
  role?: UserRole | null;
};

export type UserUpdatePersistenceInput = {
  name?: string;
  email: EmailAddress;
  role?: UserRole;
  emailVerified?: boolean;
};

export type UserUpdateSnapshot = {
  email: EmailAddress;
  role: UserRole;
};

export type SessionRevocationTarget = {
  id: SessionId;
};

export function shouldUnverifyEmail(
  currentEmail: EmailAddress,
  nextEmail: EmailAddress
) {
  return currentEmail !== nextEmail;
}
