import { describe, expect, it } from 'vitest';

import { requireTenant } from './require-tenant';
import type { TenantContext } from './types';

describe('requireTenant', () => {
  it('returns the active tenant when one is present', () => {
    const tenant: TenantContext = {
      id: 'tenant-1',
      slug: 'acme',
      role: 'owner',
    };

    expect(requireTenant(tenant)).toBe(tenant);
  });

  it('throws a tenancy setup error when no tenant is active', () => {
    expect(() => requireTenant(null)).toThrow(
      'Tenancy not enabled. requireTenant() should only be called from routes/server functions that run inside an active-tenant subtree.'
    );
  });
});
