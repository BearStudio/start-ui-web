---
paths:
  - "src/components/ui/**"
  - "src/components/form/**"
  - "src/hooks/**"
  - "src/lib/tailwind/utils.ts"
  - "src/lib/dayjs/parse-string-to-date.ts"
---

When you add, rename, or remove a component in `src/components/ui/`, `src/components/form/`, `src/hooks/`, or a registry lib (`src/lib/tailwind/utils.ts`, `src/lib/dayjs/parse-string-to-date.ts`), you MUST update `registry.json` at the project root to keep the shadcn registry in sync.

Checklist:
1. **New component** → Add a new item in `registry.json` with correct `name`, `type`, `dependencies`, `registryDependencies`, and `files`.
2. **Renamed/moved component** → Update the corresponding `files[].path` in `registry.json`.
3. **Deleted component** → Remove the item from `registry.json` and remove it from other items' `registryDependencies`.
4. **Changed imports** → If a component gains or loses an npm dependency or an internal dependency on another registry component, update `dependencies` and `registryDependencies` accordingly.
5. **Rebuild** → Run `pnpm registry:build` after changes to verify the build succeeds.

Registry item types:
- `registry:ui` for `src/components/ui/` components
- `registry:component` for `src/components/form/` components
- `registry:hook` for `src/hooks/` hooks
- `registry:lib` for utility libraries
