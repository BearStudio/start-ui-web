# Agent Instructions for start-ui-web


## What This Codebase Is

A TanStack Start application in TypeScript, organized as a strict modular monolith with hexagonal boundaries per capability. UI primitives and shared technical utilities live under `src/platform`; app-owned shell/support resources live under `src/app`; business capabilities live under `src/modules`; production wiring lives under `src/composition`.

## Canonical Commands

Use these commands instead of invoking underlying tools directly.

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the local dev server. |
| `pnpm check` | Static checks: format, lint, typecheck, depcruise, semgrep, audit. |
| `pnpm test` | Vitest unit and browser projects. |
| `pnpm test:affected:list` | List tests associated with changed files. |
| `pnpm test:affected` | Run tests associated with changed files. |
| `pnpm test:e2e:visual` | Local Chromium visual regression check for stable critical screens. |
| `pnpm test:e2e:visual:auth` | Local Chromium visual regression check for login and verification screens. |
| `pnpm test:e2e:visual:app-shell` | Local Chromium visual regression check for the authenticated app shell. |
| `pnpm test:e2e:visual:manager-users` | Local Chromium visual regression check for manager user screens. |
| `pnpm test:e2e:visual:update` | Update local visual baselines for review. |
| `pnpm build` | Production build. |
| `pnpm verify` | Full pre-merge gate: `check` + `test` + `build`. |
| `pnpm verify:task` | Task-level verification runner with timestamped logs under `test-results/task-verification/`. |
| `pnpm format:changed` | Format changed files only. |
| `pnpm check:migrations` | Guard against invalid manual migration edits. |

After code changes, run `pnpm format:changed && pnpm check && pnpm test:affected`. Before merge, run `pnpm verify`.

## Task Verification Loop

Use a layered verification loop rather than relying on one broad command.

- Start with the narrowest relevant unit, browser, or E2E checks for the behavior being changed.
- For UI changes, start the local app with `pnpm dev` or the E2E webserver path, inspect the affected flow in the Codex in-app Browser, and check desktop and mobile viewports for console errors, broken interactions, text overflow, and layout overlap.
- Capture screenshots or Playwright artifacts for meaningful UI changes. Prefer local Playwright screenshots for visual regression with `pnpm test:e2e:visual`; update baselines for review with `pnpm test:e2e:visual:update`. Do not add Percy, Applitools, Cypress, BrowserStack, or another external visual/browser service unless explicitly requested.
- After code changes, run `pnpm format:changed && pnpm check && pnpm test:affected`.
- Use `pnpm verify:task` when a single command/report is more useful than separate commands. Add `-- --visual` for UI changes, `-- --e2e-chromium` for auth/routing/session/persistence risk, and `-- --build` for production runtime risk.
- Escalate to `pnpm test:e2e --project=chromium` when auth, routing, session, persistence, upload, or full-stack behavior is touched.
- Escalate to all Playwright projects or the CI matrix when a change is likely to vary by browser.
- Run `pnpm build` for production build/runtime changes, and `pnpm verify` before merge-level handoff.
- When tests fail, inspect Playwright traces, screenshots, videos, console output, network evidence, and auth diagnostics before changing code. Treat retries as a diagnostic signal, not proof of correctness.

Local full-stack verification with seeded data, Maildev, MinIO, and the local database is the default realism level for agent work. Production smoke testing is out of scope unless read-only routes, credentials, and data safety rules are explicitly provided.

Task verification artifacts should be grouped under `test-results/task-verification/<timestamp>/` when using `pnpm verify:task`. Keep Playwright traces, screenshots, videos, and failure attachments in their default `test-results/` locations and link or summarize the relevant paths in the final handoff. Visual test baselines are reviewed repo artifacts; do not silently update them without saying why.

## Public Gates

Cross-module imports must use one of these public files:

| File | Contents |
|---|---|
| `index.ts` | Domain types, application ports, factories, stable constants. |
| `server.ts` | TanStack `createServerFn` exports only. |
| `backend.ts` | Server-only non-server-function APIs, protected runners, HTTP route handlers. |
| `client.ts` | Client-only public API, query options, client facades. |
| `presentation.ts` | React components and presentation exports. |
| `testing.ts` | Test-only public gate for owner internals. |

Do not deep-import another module's `domain/`, `application/`, `infrastructure/`, `transport/`, or `presentation/` internals. `kernel` internals are the practical exception for cross-cutting primitives.

## Module Rules


`domain/` is pure TypeScript. `application/` depends on ports, not adapters. `infrastructure/` owns SDKs and provider/database adapters. `transport/` maps protocol inputs to use cases. `presentation/` owns React UI, query options, and form schemas.

Keep route and transport handlers thin: validate and normalize input, call the relevant public module gate or use case, then map tagged outcomes or `AppError` values to the framework response.

Parse external input once at the boundary with the appropriate schema mechanism: TanStack `validateSearch`, form schemas, HTTP DTO schemas, upload/webhook validators, or focused Zod schemas. Pass typed, normalized values inward rather than re-parsing inside domain or application code.

Business and application time must come from an injected `Clock` port. Direct `new Date()` calls belong only in clock adapters, schema/database defaults, tests, scripts, and external/framework boundary mapping.

Keep files named by concrete concern. Avoid catch-all `utils.ts`, broad `service.ts`, or multi-purpose files; prefer scoped names such as `query-helpers.ts`, `cache-control.ts`, or `book-repository-drizzle.ts`.

## Result and Outcome Policy

- Expected business outcomes must be domain-tagged `Result.Ok` variants from `@swan-io/boxed`, such as `{ type: 'book_found'; book: Book }` or `{ type: 'book_not_found' }`.
- Internal, external-service, system, and persistence failures must be `Result.Error(AppError)`.
- Use direct Boxed APIs (`Result.Ok`, `Result.Error`, `isOk`, `isError`, `get`, `getError`) instead of local `ok` / `fail` wrappers.
- Use `ts-pattern` with Boxed interop (`Result.P.Ok(...)` and `Result.P.Error(...)`) for exhaustive result handling at mapping boundaries.
- Do not return nullable or boolean business outcomes from app-owned ports; model those branches as tagged outcomes.
- Do not throw or catch for normal app-owned business flow. Code under `src/modules/*/application/**` should return `Result.Ok(...)` for expected outcomes and `Result.Error(AppError)` for failures.
- Catch failures only at external, service, and persistence boundaries such as Drizzle, Better Auth, and Resend adapters. Keep `TransactionRunner.run` as the low-level promise primitive and map transaction failures at the DB-backed boundary or use case boundary that owns the transaction. Any application-layer `try/catch` must be limited to a use case that owns a transaction boundary and must convert the failure to `Result.Error(AppError)`.
- Transport, composition, HTTP, and framework adapter boundaries may throw only when the underlying contract is exception-driven, such as TanStack `ServerFnError`, Better Upload `RejectUpload`, Better Auth callbacks, startup/config validation, or final HTTP error mapping.

## Utility Library Guidance

- Use `ts-pattern` when branching over discriminated unions, Boxed `Result` values, tuple-derived UI states, or non-trivial unknown-shape guards where `.exhaustive()` / `isMatching` improves safety. Keep simple one-condition guards as plain `if` checks.
- Use Remeda for non-trivial production collection and object transforms when it improves readability or type narrowing: `pipe`, data-last `map` / `filter` / `flatMap`, `pickBy`, `mapValues`, `pullObject`, `fromEntries`, typed guards such as `isString` / `isTruthy`, and `unique` / `uniqueBy`.
- Keep native APIs for straightforward JSX render loops, framework-specific chains such as fast-check arbitraries or Drizzle builders, and simple one-off array operations where Remeda would only add indirection.

## Common Guardrails

- `src/platform` must not import `modules`, `routes`, or `composition`.
- `src/modules` must not import `src/app`; routes/app containers compose app shell/support UI around module presentation.
- `src/modules/*/testing.ts` and platform testing gates are test-only and must not be imported by production source.
- Module internals must not import `@/composition`; dependencies are injected through factories or public server barrels.
- Routes import modules only through `index.ts`, `server.ts`, `backend.ts`, `client.ts`, or `presentation.ts`.
- `src/modules/*/presentation/schema.ts` must emit static error keys, not import `i18next` or `react-i18next`; `src/platform/components/form/form-field-error.tsx` translates at render time.
- Better Auth server APIs are confined to `src/modules/auth` and `src/composition/auth.ts`.
- Provider-specific auth tokens stay server-side and do not cross client/public boundaries.
- Legacy roots `src/components`, `src/hooks`, `src/lib`, `src/layout`, `src/features`, and `src/emails` are forbidden; use `src/platform` or `src/modules/<capability>`.
- Route loaders that read search params must declare `validateSearch` and `loaderDeps`, and query keys must include the same normalized values.
- Existing SQL migration files under `drizzle/migrations` are immutable. Change Drizzle schema files and run `pnpm db:generate` for new migrations; run `pnpm check:migrations` when migration or schema files are touched.

## Auth Boundary

Auth is provider-neutral above infrastructure. Application code depends on focused ports:

- `SessionGateway`
- `AuthorizationGateway`
- `AuthEmailPort`
- `UserAdminGateway`

Better Auth is the current adapter under `src/modules/auth/infrastructure/better-auth`. A future provider should implement the same ports and be selected in `src/composition/auth.ts`.

## Tests

Use the cheapest test that proves the behavior:

| Type | Location |
|---|---|
| Unit | `tests/unit/**/*.unit.{test,spec}.{ts,tsx}` |
| Browser/component | `tests/browser/**/*.browser.{test,spec}.tsx` |
| Integration | `tests/integration/**/*.integration.test.ts` |
| Architecture/security | `tests/architecture/**/*.unit.spec.ts`, `tests/security/**/*.unit.spec.ts` |
| E2E | `tests/e2e/*.spec.ts` |
| Fixtures/support | `tests/support`, `tests/server`, nearest `*.fixture.tsx` when useful |

When a regression class is likely to repeat, add a guardrail through depcruise, Semgrep, or an architecture test.

When touching Drizzle repositories, raw `sql`, `db.execute`, schema serialization, or migrations, prefer an integration test against the local database driver in addition to focused unit coverage. Mocked DB unit tests do not prove SQL serialization or migration behavior.
