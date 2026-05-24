import type { QueryClient } from '@tanstack/react-query';

import type { FlagsAdapter } from '@/platform/flags';
import type { TelemetryAdapter } from '@/platform/telemetry';
import type { TenantContext } from '@/platform/tenant';

/**
 * Single typed contract every route loader and `beforeLoad` reads from. The
 * concrete instance is built once in `src/router.tsx` (the only place that
 * imports the composition layer).
 *
 * Module/feature code MUST read these via `context` rather than importing
 * `@/composition` directly so the composition root remains the only wiring
 * surface.
 */
export type RouterContext = {
  queryClient: QueryClient;
  /**
   * Auth session accessor. Resolves the active session via Better Auth on
   * SSR (using request cookies) and via fetch on client navigations. The
   * `queryClient` is used to deduplicate concurrent `beforeLoad` calls within
   * a single navigation.
   */
  auth: {
    getSession: () => Promise<AuthSessionLike | null>;
  };
  /** Telemetry/error reporting (Sentry-backed in production). */
  telemetry: TelemetryAdapter;
  /** Feature flag adapter (no-op by default). */
  flags: FlagsAdapter;
  /** Reserved for active-tenant context; always `null` until tenancy lands. */
  tenant: TenantContext | null;
};

/**
 * Minimum shape `beforeLoad` needs from the session. Kept local to avoid a
 * cross-module type import in the platform package — the auth module's
 * `AuthSession` is structurally compatible.
 */
export type AuthSessionLike = {
  user: {
    id: string;
    email: string;
    name: string | null;
    role?: string | null;
    onboardedAt: Date | string | null;
  };
  session: {
    id: string;
  };
};
