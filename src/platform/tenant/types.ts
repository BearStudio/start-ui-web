/**
 * Reserved type slot for the active-tenant context.
 *
 * Multi-tenancy is intentionally deferred today. When introduced, this type
 * should describe the minimum information every route and server function
 * needs to scope reads and writes to a single tenant — typically the tenant
 * id, the user's membership/role within it, and any plan/limit flags.
 *
 * The router context carries `tenant: TenantContext | null`. It is always
 * `null` until multi-tenancy is wired up; `beforeLoad` on `/app` will populate
 * it, and server functions read it via a tenant-aware variant of
 * `withProtectedContext`.
 */
export type TenantContext = {
  readonly id: string;
  readonly slug: string;
  readonly role: string;
};
