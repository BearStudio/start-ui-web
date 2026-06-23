# Security Risk Register

Last reviewed: 2026-06-23

## Temporary Accepted Dependency Advisories

`pnpm audit --audit-level=low --json` currently reports one low and
three moderate advisories. The related scoped `@skidding/launch-editor`
entry is not reported by `pnpm audit`, but is tracked here because it follows
the same Windows UNC path handling risk shape as `launch-editor`.

| Package | Advisory | Current path | Decision | Next review |
| --- | --- | --- | --- | --- |
| `esbuild >= 0.27.3 < 0.28.1` | GHSA-g7r4-m6w7-qqqr: Windows-only arbitrary file read from the esbuild development server | `tsx@4.22.4` through Vite/TanStack Start/build tooling paths | Temporarily accepted because the vulnerable behavior requires the esbuild development server on Windows. The package appears in the production dependency graph, but the deployed app should not expose esbuild `serve`/`servedir`; upgrade or override to `esbuild >= 0.28.1` when compatible. | 2026-07-23 |
| `protobufjs <= 7.6.2` | GHSA-f38q-mgvj-vph7 / CVE-2026-54269: schema-derived names can shadow runtime-significant properties | `@testcontainers/postgresql > testcontainers > dockerode > protobufjs` | Temporarily accepted because this is dev/integration-test container tooling and the application does not accept untrusted protobuf schemas or descriptors. Upgrade or override to `protobufjs >= 7.6.3` when compatible. | 2026-07-23 |
| `launch-editor <= 2.14.0` | GHSA-v6wh-96g9-6wx3 / CVE-2026-53632: Windows UNC path handling can disclose NTLMv2 hashes | `@tanstack/devtools-vite > launch-editor` | Temporarily accepted because this is local devtools middleware. Do not expose the Vite/devtools server to untrusted networks; upgrade or override to `launch-editor >= 2.14.1` when compatible. | 2026-07-23 |
| `js-yaml <= 4.1.1` | GHSA-h67p-54hq-rp68 / CVE-2026-53550: quadratic-complexity DoS in merge key handling | `@svgr/cli > cosmiconfig > js-yaml` | Temporarily accepted because this is local icon-generation tooling and the project controls the SVGR configuration inputs. Upgrade or override to `js-yaml >= 4.2.0` when compatible. | 2026-07-23 |
| `@skidding/launch-editor 2.13.2` | Related to GHSA-v6wh-96g9-6wx3: scoped launch-editor fork has the same Windows UNC path handling risk shape | `react-cosmos > @skidding/launch-editor` | Temporarily accepted because this is local Cosmos developer tooling and npm audit does not currently flag the scoped fork. Do not expose Cosmos/open-editor middleware to untrusted networks; replace or patch when a compatible fixed scoped package is available. | 2026-07-23 |

High-severity audit results remain blocking through `pnpm security:audit`.

## Resolved Previous Accepted Advisories

- `esbuild <= 0.24.2` via `drizzle-kit` and `@esbuild-kit/*` is no longer
  reported by the current audit after the lockfile override to
  `@esbuild-kit/core-utils>esbuild: 0.25.0`.
- `ws 8.19.0` via `react-cosmos` is no longer reported by the current audit
  after the lockfile override to `react-cosmos>ws: 8.21.0`.
- `qs 6.14.x/6.15.x` via `react-cosmos` and Stryker tooling is no longer
  reported by the current audit after the lockfile override to `qs: 6.15.2`.

## Implemented Controls

- Global TanStack Start middleware now sets report-only CSP, clickjacking, referrer, content-type, permissions-policy, and production HSTS headers.
- `/api/upload` now requires same-origin `Origin` on non-GET requests; Better Auth routes and the Resend webhook keep their provider-specific protection.
- TanStack Router/Start incident package versions and vulnerable TanStack floors are blocked by `scripts/check-tanstack-security.mjs`.
- CI installs dependencies with lifecycle scripts disabled, then explicitly runs trusted local build metadata generation.
