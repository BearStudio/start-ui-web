import type { UserId } from '@/modules/kernel/domain/ids';

export type PermissionRequest = Record<string, readonly string[]>;

export interface PermissionChecker {
  hasPermission(
    userId: UserId,
    permissions: PermissionRequest
  ): Promise<boolean>;
}
