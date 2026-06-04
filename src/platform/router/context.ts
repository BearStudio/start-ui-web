import type { QueryClient } from '@tanstack/react-query';

import type { FlagsAdapter } from '@/platform/flags';
import type { TelemetryAdapter } from '@/platform/telemetry';

/**
 * Single typed contract every route loader and `beforeLoad` reads from. The
 * concrete route instance is built once in `src/router.tsx`; root route,
 * server entry, and API/server transport entrypoints are the other wiring
 * surfaces that may cross into composition.
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
    getSession: (options?: {
      requireFresh?: boolean;
    }) => Promise<CurrentSessionLike | null>;
    getSessionSnapshot: () => CurrentSessionLike | null | undefined;
  };
  /** Telemetry/error reporting (Sentry-backed in production). */
  telemetry: TelemetryAdapter;
  /** Feature flag adapter (no-op by default). */
  flags: FlagsAdapter;
};

/**
 * Minimum shape routes need from the sanitized browser current-session query.
 * Kept local to avoid a cross-module type import in the platform package.
 */
export type CurrentSessionLike = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    emailVerified?: boolean;
    role: string;
    onboardedAt?: Date | string | null;
  };
  session: {
    id: string;
    expiresAt?: Date | string;
  };
  scope: {
    userId: string;
    role: string;
  };
  scopeKey: string;
};

export type AuthSessionLike = CurrentSessionLike;
