# Module Rules

## Shape

```text
src/modules/<capability>/
  index.ts
  server.ts
  backend.ts
  client.ts
  presentation.ts
  testing.ts
  factory.ts
  domain/
  application/
    ports/
    use-cases/
  infrastructure/
  transport/
  presentation/
```

Only add folders and public gates when the module needs them.

- `backend.ts` exports server-only non-server-function APIs, protected runners, and HTTP route handlers.
- `testing.ts` exposes test-only public gates for owner internals.

## Layers

| Layer | Allowed | Forbidden |
|---|---|---|
| `domain` | Pure TS, kernel domain types. | React, router, Query, infrastructure, transport, SDKs. |
| `application` | Own domain, own ports, kernel ports. | Infrastructure, transport, React, router, Query. |
| `infrastructure` | Own ports/domain, kernel, SDKs. | Other modules' private internals. |
| `transport` | Protocol mapping and injected use cases. | Own infrastructure directly, composition imports. |
| `presentation` | React UI, queries, schemas, platform UI. | Own infrastructure directly. |

## Composition

Production wiring lives in `src/composition/<capability>.ts`.

- Use `createCachedFactory`.
- Return singletons when no overrides are provided.
- Return fresh instances when overrides are provided.
- Merge overrides explicitly with `??`.

## Auth and Runtime Config

- Auth depends on `SessionGateway`, `AuthorizationGateway`, `AuthEmailPort`, and `UserAdminGateway`.
- Runtime config depends on `RuntimeConfigSource`.
- Provider/env details live in infrastructure adapters and are selected by composition.
