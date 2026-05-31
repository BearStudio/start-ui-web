import { describe, expect, it } from 'vitest';

import {
  hasRolePermission,
  isRole,
  parseRole,
  type Permission,
  type Role,
} from '@/modules/auth/domain/permissions';

describe('role parsing', () => {
  it('accepts declared roles', () => {
    expect(isRole('admin')).toBe(true);
    expect(parseRole('user')).toBe('user');
  });

  it('rejects inherited object keys', () => {
    expect(isRole('toString')).toBe(false);
    expect(parseRole('constructor')).toBeUndefined();
  });
});

describe('hasRolePermission', () => {
  it('allows permissions granted to the role', () => {
    expect(hasRolePermission('admin', { session: ['revoke'] })).toBe(true);
  });

  it('returns false for unknown roles and malformed permission payloads', () => {
    expect(hasRolePermission('owner' as Role, { session: ['revoke'] })).toBe(
      false
    );
    expect(hasRolePermission('admin', null as unknown as Permission)).toBe(
      false
    );
    expect(
      hasRolePermission('admin', { session: 'revoke' } as unknown as Permission)
    ).toBe(false);
  });
});
