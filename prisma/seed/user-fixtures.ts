export type CanonicalUserFixture = {
  name: string;
  email: string;
  role: 'user' | 'admin';
};

type CanonicalUserState = {
  name: string;
  role: 'user' | 'admin' | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  emailVerified: boolean;
  onboardedAt: Date | null;
};

export type CanonicalUserRepairData = Partial<{
  name: CanonicalUserFixture['name'];
  role: CanonicalUserFixture['role'];
  banned: false;
  banReason: null;
  banExpires: null;
  emailVerified: true;
  onboardedAt: Date;
}>;

export const canonicalUsers = [
  {
    name: 'User',
    email: 'user@user.com',
    role: 'user',
  },
  {
    name: 'Admin',
    email: 'admin@admin.com',
    role: 'admin',
  },
] satisfies CanonicalUserFixture[];

export function getCanonicalUserRepairData(
  existingUser: CanonicalUserState,
  canonicalUser: CanonicalUserFixture,
  now: Date = new Date()
): CanonicalUserRepairData {
  const repairData: CanonicalUserRepairData = {};

  if (existingUser.name !== canonicalUser.name) {
    repairData.name = canonicalUser.name;
  }

  if (existingUser.role !== canonicalUser.role) {
    repairData.role = canonicalUser.role;
  }

  if (
    existingUser.banned ||
    existingUser.banReason ||
    existingUser.banExpires
  ) {
    repairData.banned = false;
    repairData.banReason = null;
    repairData.banExpires = null;
  }

  if (!existingUser.emailVerified) {
    repairData.emailVerified = true;
  }

  if (!existingUser.onboardedAt) {
    repairData.onboardedAt = now;
  }

  return repairData;
}
