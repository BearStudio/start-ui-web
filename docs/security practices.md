### Current Implementation Status

This document is a high-level practices reference. Current accepted dependency
risks and implemented TanStack Start hardening controls are tracked in
`docs/security-risk-register.md`.

### Input Validation

- **Zod schemas** at HTTP boundaries for incoming payloads (i.e. webhooks) — no unvalidated external input reaches business logic
- Parameterized queries are the default path, with guardrails to detect unsafe raw SQL usage
- LIKE pattern escaping utility for search queries
- Branded types for phone numbers (E.164), emails, IDs — preventing type confusion at compile time

### Security Scanning & SAST

Automated scanners run in CI:

| Scanner                                | Scope                                                        | Integration                                   |
| -------------------------------------- | ------------------------------------------------------------ | --------------------------------------------- |
| Semgrep                                | 123 custom rules: layer boundary enforcement, SDK confinement, prohibited patterns, prompt-injection guards, mrkdwn-escaping | GitHub Actions workflow + repo `pnpm semgrep` |
| Octoscan (`synacktiv/action-octoscan`) | GitHub Actions workflow supply-chain hardening               | GitHub Actions + SARIF upload                 |
| Dependency-Cruiser                     | 51 cross-cutting architectural rules (no-circular, SDK confinement to designated modules, transport→DB bypass, etc.) | `pnpm depcruise` in CI                        |
| Sheriff (`@softarc/sheriff-core`)      | Module-barrel access + 12 layer tags (barrel, domain, ports, use-cases, cache, application, infrastructure, transport, config, observability, utils, validation) | `pnpm lint:sheriff` in CI                     |
| `pnpm audit`                           | npm advisory database (high+)                                | CI step                                       |
| GitHub Dependency Review               | PR-level vulnerable dependency gating                        | Workflow on pull-request                      |

Semgrep rules enforce e.g. no bare `new Error()`, no `console.log` in modules outside React components, no direct `process.env` access outside `modules/kernel/config`, no `as` type assertions outside tests, strict SDK confinement (Stripe to memberships, Twilio to whatsapp, Attio to external-users, MongoDB to kernel/onboarding-simulation/introductions), and prohibited PII patterns in WhatsApp logs.

### SOC 2 Readiness

While a formal SOC 2 audit has not yet been completed, the codebase implements controls aligned with SOC 2 trust service criteria:

- **Security**: RBAC, encryption at rest/in transit, brute-force protection, CSRF, CSP
- **Availability**: Vercel's managed infrastructure, automated migration rollback alerts, Pushover on-call notifications
- **Processing Integrity**: webhook idempotency, domain error model, transactional consistency
- **Confidentiality**: PII masking in logs, branded types preventing accidental exposure, Zod-validated boundaries
- **Privacy**: data classification by table, access controls per permission scope

### CI Pipeline

Every pull request and push to main triggers a workflow that runs (per `.github/workflows/ci.yml`, `semgrep.yml`, `actions-scanning.yml`, `dependency-review.yml`):

1. `pnpm security:audit` — high-severity npm advisories
2. `pnpm test:affected` — Vitest run for tests reachable from changed files
3. `pnpm lint` — Biome with `--error-on-warnings`
4. `pnpm dupes` — jscpd code duplication detection
5. `pnpm depcruise` — 51 dependency-cruiser architectural rules
6. `pnpm lint:sheriff` — Sheriff layer-and-module-boundary verification
7. Semgrep — 123 custom rules (separate workflow)
8. Octoscan — GitHub Actions supply-chain hardening (separate workflow, SARIF to Security tab)
9. GitHub Dependency Review — vulnerable dependency gating on PRs

Coverage is generated locally via `pnpm test:coverage` (Vitest + V8). The `pnpm test:affected` step relies on `scripts/affected-tests.ts`, which uses dependency-cruiser to compute reachability.

### Testing Strategy

| Test Type           | Framework                                  | Purpose                                                      |
| ------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| Unit                | Vitest                                     | Domain logic, pure functions, use cases in isolation         |
| Integration         | Vitest + PGlite                            | Repository adapters against real SQL (in-memory PostgreSQL via WASM) |
| Integration (Mongo) | Vitest + `mongodb-memory-server`           | Mongo-backed adapters in introductions / onboarding-simulation |
| Component           | React Testing Library                      | UI components with interaction testing                       |
| Architecture        | dependency-cruiser + Sheriff + Semgrep     | Boundary enforcement, SDK confinement, layer rules           |
| Property            | `@fast-check/vitest`                       | Property-based tests for invariants                          |
| Mutation            | Stryker (`@stryker-mutator/vitest-runner`) | Test-suite quality on five high-risk modules: intros-consent, onboarding-checkout-payments, events-rsvps-communications, whatsapp-webhook-delivery, auth-totp-security |

### Code Quality Enforcement

- Biome: ~400 individual rule configurations covering correctness, complexity, style, performance, security, and accessibility
- Cognitive complexity limit: 12 per function (`noExcessiveCognitiveComplexity`)
- Function length limit: 60 lines, blank lines and IIFEs excluded (`noExcessiveLinesPerFunction`); relaxed via overrides for factories, repositories, and similar wiring code
- Oxlint: Additional TypeScript, React performance, and import-cycle detection
- Knip: Unused export detection
- Dependabot: Weekly automated dependency update PRs (`npm` and `github-actions` ecosystems)

## Disaster Recovery & Business Continuity

### Operational Resilience

- Database migrations: pre-validated before execution; failures trigger automatic GitHub issue creation and Pushover on-call alert with commit SHA, branch, and run URL
- Webhook idempotency: all webhook handlers (Stripe, Twilio, Resend) are idempotent — replayed events produce no side effects
- Fail-closed security: authentication lockout returns 60-second retry-after on backend failures rather than allowing access
- Graceful degradation: cache failures don't break functionality (cache-aside pattern); Edge Config failures return safe defaults; rate limiter fails open with logged anomaly
- Automated alerting: critical domain events, auth lockouts, webhook signature failures, and migration results all push to on-call via Pushover

### Deployment Safety

- Preview deployments: every PR gets an isolated environment via Vercel's Git integration
- Automated testing: affected-tests CI run gates every merge; full Vitest suite runs locally and via mutation testing
- Architectural guardrails: 51 dependency-cruiser rules + Sheriff layer enforcement + 123 Semgrep rules prevent regression at the structural level
- Security scanning: Semgrep, Octoscan, GitHub Dependency Review, and `pnpm audit` run in CI with SARIF upload to the Security tab where applicable
- Dependabot: weekly automated dependency-update PRs (npm and GitHub Actions ecosystems) catch vulnerabilities proactively
- Migration safety: separate `db-migrate.yml` workflow runs schema-drift, file, journal, snapshot, and dry-apply validation before executing migrations, with Pushover alerts on failure
