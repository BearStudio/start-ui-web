import type { UserId } from '@/modules/kernel/domain/ids';

export type AccountProfileUpdate = {
  name: string;
};

export type AccountOnboardingUpdate = {
  name: string;
  onboardedAt: Date;
};

export type AccountUpdateResult = {
  id: UserId;
};

export function normalizeAccountName(name: string) {
  return name.trim();
}
