# Architecture Rules

Authoritative reference: `AGENTS.md`.

## Imports

- Cross-module imports go through public gates only: `index.ts`, `server.ts`, `backend.ts`, `client.ts`, `presentation.ts`, or test-only `testing.ts`.
- `src/platform` must not import `modules`, `routes`, or `composition`.
- Module internals must not import `@/composition`.
- `drizzle-orm`, `pg`, and `postgres` stay in infrastructure, kernel infrastructure, composition, or drizzle tooling.
- Better Auth imports stay in `src/modules/auth` and `src/composition/auth.ts`.
- Legacy roots `src/components`, `src/hooks`, `src/lib`, `src/layout`, `src/features`, and `src/emails` are forbidden.

## Schemas

- `src/modules/*/presentation/schema.ts` emits translation keys only.
- Do not import `i18next` or `react-i18next` in schemas.
- Render-time translation happens in `src/platform/components/form/form-field-error.tsx`.

## Routes

- Routes stay thin and import modules through public gates.
- Loaders reading search params must declare `validateSearch` and `loaderDeps`.
- Server functions and HTTP handlers enforce auth and permissions independently from route guards.
