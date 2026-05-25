# Strict Modular Monolith Organization

This app uses a strict modular monolith shape:

```text
src/
  routes/          TanStack file routes and URL/auth/data-loading edge
  composition/     production wiring, singletons, and test overrides
  modules/         business and shell capabilities
  platform/        shared technical substrate with no business imports
```

## Module Contract

Business and shell capabilities live under `src/modules/<capability>`.

```text
modules/<capability>/
  index.ts         domain/application public API
  presentation.ts  React screens, forms, schemas, guards
  client.ts        client adapters such as Query options and auth helpers
  server.ts        server/TanStack transport adapter exports
  factory.ts       pure use-case assembly when the module has use cases
  domain/          business language, invariants, policies
  application/     use cases and ports
  infrastructure/  provider/database/SDK adapters
  transport/       protocol translation
```

Cross-module imports must use `index.ts`, `presentation.ts`, `client.ts`, or
`server.ts`. Deep imports are allowed inside the same module only.

## Platform Contract

`src/platform` contains module-agnostic UI primitives, form primitives, hooks,
query provider utilities, i18n/dayjs/zod helpers, environment parsing, styles,
icons, and generic upload UI.

`platform` must not import from `modules`, `routes`, or `composition`.

## Composition Contract

`src/composition` is the production wiring root. It may import module factories,
module infrastructure adapters, and platform utilities. Use cases and pure HTTP
handlers receive dependencies explicitly instead of importing composition.

Auth provider details are isolated behind auth ports. Better Auth is the current
adapter; a future WorkOS/AuthKit adapter should implement the same auth gateway
and client facade before changing routes or feature modules.

The auth module exposes provider-neutral contracts from
`src/modules/auth/application/ports`. Do not pass Better Auth client/server
objects across module boundaries. User/session management should depend on
`AuthGateway` and neutral identifiers such as `sessionId`; provider-specific
values, including Better Auth session tokens, stay inside the Better Auth
adapter. A WorkOS adapter should live under `auth/infrastructure/workos` and be
selected from `src/composition/auth.ts`.

## Route Contract

Routes stay thin. They validate path/search state, seed initial server-backed
data through loaders, select route error/not-found UX, and render module
presentation screens. Screens may use React Query for cache reads, continuation
pages, refresh, and mutations.

Authenticated route subtrees enforce auth in `beforeLoad` via
`beforeLoadAuthenticated()` from `@/modules/auth/presentation`. Component-level
session guards are not allowed — guards belong at the route boundary so the
redirect happens before any layout shell paints. Role/permission and onboarding
checks live in the same `beforeLoad` helper so every child route inherits them.

## Router Context Contract

The router context is the single read-side contract that every route loader and
`beforeLoad` reads from. It is constructed once in `src/router.tsx` from the
composition layer and typed in `src/platform/router/context.ts`. Current shape:

- `queryClient` — shared TanStack Query client used by `ensureQueryData` /
  `prefetchQuery` in loaders.
- `auth.getSession()` — per-navigation cached session accessor. Resolves
  server-side via the Better Auth gateway during SSR and via fetch on client
  navigations. Used by `beforeLoadAuthenticated()`.
- `telemetry` — Sentry adapter exposing `captureException`, `setUser`, and a
  `startSpan` helper. Route loaders, `beforeLoad`, and `errorComponent` call
  through this slot rather than importing Sentry directly.
- `flags` — feature-flag adapter (currently a no-op stub). Reserved for an
  OpenFeature/LaunchDarkly provider when needed.
- `tenant` — reserved slot for active-tenant context. Always `null` today;
  populated by `beforeLoad` on `/app` when multi-tenancy is enabled.

Routes that need a dependency must read it off `context` rather than importing
`@/composition` directly — the composition root is the only file that wires
concretes into the context.

## Response Cache Policy

Every response that depends on the authenticated session must set a `private`
cache policy. Use the helpers in `@/platform/http/cache-control`:

- `cachePrivateNoStore()` — default for authenticated reads/mutations.
- `cachePrivateShortLived(seconds)` — short browser caching with
  `Vary: Cookie, Authorization`.
- `cachePublic({ maxAgeSeconds, reason })` — only for genuinely
  cross-user-safe responses. The `reason` parameter is mandatory so reviewers
  can audit each shared-cache decision.

Raw `Cache-Control: public` strings outside the helper are rejected by the
`raw-cache-control-public` semgrep rule.

## CSRF Policy

TanStack Start ships a default CSRF middleware that protects same-origin server
functions out of the box. This app does not define `src/start.ts`, so the
default chain is in effect.

If `src/start.ts` is ever added, it must explicitly register the CSRF
middleware — defining the file replaces the defaults rather than extending
them. Authenticated server functions and server routes rely on this protection;
omitting it would expose every browser-callable RPC to cross-site requests.
