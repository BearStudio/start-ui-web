export type CanonicalUserFixture = {
  name: string;
  email: string;
  role: 'user' | 'admin';
};

type CanonicalUserState = {
  name: string;
  role: 'user' | 'admin' | null;
  emailVerified: boolean;
  onboardedAt: Date | null;
};

export type CanonicalUserRepairData = Partial<{
  name: CanonicalUserFixture['name'];
  role: CanonicalUserFixture['role'];
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

  if (!existingUser.emailVerified) {
    repairData.emailVerified = true;
  }

  if (!existingUser.onboardedAt) {
    repairData.onboardedAt = now;
  }

  return repairData;
}
