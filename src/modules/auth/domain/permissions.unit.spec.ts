import { describe, expect, it } from 'vitest';

import { hasRolePermission, type Permission, type Role } from './permissions';

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
