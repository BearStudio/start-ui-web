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
