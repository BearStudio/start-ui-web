# Base UI to ui-sdk migration

Temporary working notes for replacing `@base-ui/react` with `@ui-sdk/react`. Delete this file in phase 4.

## Rules

- Base UI and ui-sdk coexist until phase 4. Migrate one group of components per PR.
- Only `src/components/ui` imports Base UI. Keep each wrapper's public API (names, variants, props) so call sites don't change. When a prop has no ui-sdk equivalent, remove it and update its call sites in the same PR.
- Before migrating a component, read `node_modules/@ui-sdk/react/docs/components/<name>.md` and follow the `ui-sdk` skill.
- Every migrated component keeps its Storybook story working and gets the tests from the `ui-sdk` skill (agent test, keyboard, ARIA).

## Phases

| Phase | Scope |
| ----- | ----- |
| 0 | `@layer ui-sdk;` in `app.css`, this file (done) |
| 1 | `useRender` / `mergeProps` → `renderElement` / `mergeProps` from `@ui-sdk/react/primitive` (badge, breadcrumb, sidebar); Button, Separator, Avatar, ScrollArea |
| 2A | Checkbox, CheckboxGroup (`Group` section of `checkbox.md`), RadioGroup, NumberInput |
| 2B | Select, Combobox; check every `src/components/form/field-*` with react-hook-form |
| 3A | Tooltip, Popover, DropdownMenu (→ Menu) |
| 3B | Dialog, Sheet, Drawer; drop `*Portal`, `nativeButton`, `nativeButtonTrigger` |
| 4 | `pnpm remove @base-ui/react`, delete this file |

## State attributes

Checked in the rendered DOM with `@ui-sdk/react@0.1.0-beta.13`, except rows marked "docs".

| Base UI | ui-sdk | Where |
| ------- | ------ | ----- |
| `data-open` | `data-open` (trigger and content) | popups |
| `data-closed` | `data-closed` (trigger; content unmounts once its exit ends) | popups |
| `data-popup-open` (trigger) | `data-open` on the trigger | dropdown-menu, sidebar |
| `data-starting-style` / `data-ending-style` | same | popups, indicators |
| `data-side` | same, plus `data-align` | positioned popups |
| `data-checked` / `data-unchecked` | same (root and indicator) | checkbox, radio, menu items |
| `data-highlighted` | same | menu, select, combobox items |
| `data-swiping` | `data-dragging` (docs) | drawer |

## Spike findings

- **No portals.** Popups render in place and use the browser top layer (`:popover-open`). A Popover opened inside a Dialog is the topmost element at its position, with no z-index.
- **Dialog content** is a `div` in the top layer with `aria-modal="true"`, not a native modal `<dialog>`: style the overlay through `DialogBackdrop` / `DrawerBackdrop`, not `::backdrop`.
- **Events bubble through the DOM** around a popup. Keep popups out of clickable cards and links.
- **SSR** works with `renderToString`. Closed content isn't in the server HTML, and ids look like `ui-sdk-_R_0_-trigger`: never target them in CSS or tests.
