# CONTRIBUTING

Thank you for considering contributing to this repository!

## Submitting a pull request

1. Fork and clone the repository
2. Create a new branch: `git checkout -b my-branch-name`
3. Make your changes (if you want to work on an issue, make sure you have been assigned that issue by a BearStudio's team member).
4. Run the tests and commit.
5. Push to your fork and submit a pull request.
6. You can now work on another issue to way for you PR to be merged.

> 💡 Please make sure your PR is readable for the most.
> Write a good commit message.
> Also, make sure that the linting is correct.

## Component Registry

Start UI exposes a [shadcn registry](https://ui.shadcn.com/docs/registry) so that components can be installed individually in other projects.

### How it works

- `registry.json` at the project root defines every registry item (UI components, form fields, hooks, libs).
- `pnpm registry:build` generates JSON files in `public/r/` from that definition.
- In production, the registry is served at `https://demo.start-ui.com/r/<name>.json`.

### Keeping the registry up to date

Whenever you **add, rename, move, or delete** a component in `src/components/ui/`, `src/components/form/`, or `src/hooks/`, you must update `registry.json`:

| Action | What to do in `registry.json` |
|---|---|
| Add a component | Add a new item with `name`, `type`, `files`, `dependencies`, `registryDependencies` |
| Rename/move a component | Update the `files[].path` entry |
| Delete a component | Remove the item and remove it from other items' `registryDependencies` |
| Change a component's imports | Update `dependencies` (npm packages) and `registryDependencies` (other registry items) |

After changes, run `pnpm registry:build` to verify the build succeeds.

### Registry item types

| Type | Used for |
|---|---|
| `registry:ui` | Components in `src/components/ui/` |
| `registry:component` | Components in `src/components/form/` |
| `registry:hook` | Hooks in `src/hooks/` |
| `registry:lib` | Utility libraries (e.g. `cn`, `parse-string-to-date`) |

## Translations

You only need to maintain the english and french translations for you PR.
Other language translations are not required to submit a PR 😉
