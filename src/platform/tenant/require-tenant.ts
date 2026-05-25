import type { TenantContext } from './types';

/**
 * Asserts that a tenant is present on the router/server context. Today the
 * function always throws because multi-tenancy is not wired; it exists so the
 * future enforcement point is already named and discoverable.
 *
 * Once tenancy ships, this helper will narrow `context.tenant` from
 * `TenantContext | null` to `TenantContext` for the caller.
 */
export const requireTenant = (tenant: TenantContext | null): TenantContext => {
  if (!tenant) {
    throw new Error(
      'Tenancy not enabled. requireTenant() should only be called from routes/server functions that run inside an active-tenant subtree.'
    );
  }
  return tenant;
};
