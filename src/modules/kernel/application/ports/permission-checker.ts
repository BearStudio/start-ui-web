import type { ApplicationResult } from '../result';
import type { UserId } from '@/modules/kernel/domain/ids';

export type PermissionRequest = Record<string, readonly string[]>;

export type PermissionCheckOutcome =
  | { type: 'permission_granted' }
  | { type: 'permission_denied' };

export interface PermissionChecker {
  hasPermission(
    userId: UserId,
    permissions: PermissionRequest
  ): Promise<ApplicationResult<PermissionCheckOutcome>>;
}
