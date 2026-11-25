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
| 2A | Checkbox, CheckboxGroup (`Group` section of `checkbox.md`), RadioGroup, NumberInput (done) |
| 2B | Select, Combobox; check every `src/components/form/field-*` with react-hook-form (done) |
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
| `data-indeterminate` | same, with `aria-checked="mixed"`; neither `data-checked` nor `data-unchecked` is set | checkbox |
| `indeterminate` prop | `checked` / `defaultChecked="indeterminate"` | checkbox |
| `data-readonly` | same, on every number input part | number-input |
| disabled step button | `data-disabled` and `aria-disabled="true"` (no native `disabled`), also at `min` / `max` | number-input |
| `data-slot` of a `render` element | the part's slot wins (`number-input-control`, not `input-group-control`) | every part |
| `data-highlighted` | same | menu, select, combobox items |
| `data-selected` on items | same, plus `aria-selected="true"`, also on the item indicator | select, combobox items |
| `data-placeholder` | same, on the trigger and `select-value` while nothing is selected | select |
| `data-empty` on the popup | `data-empty` on `combobox-empty` while nothing matches, not on the popup | combobox |
| `data-disabled` on items | same, plus `aria-disabled="true"` | select, combobox items |
| `Select.GroupLabel` / `Combobox.GroupLabel` | `SelectGroupLabel` / `ComboboxGroupLabel` (`SelectLabel` and `ComboboxLabel` name the control) | select, combobox |
| `data-swiping` | `data-dragging` (docs) | drawer |

## Spike findings

- **No portals.** Popups render in place and use the browser top layer (`:popover-open`). A Popover opened inside a Dialog is the topmost element at its position, with no z-index.
- **Dialog content** is a `div` in the top layer with `aria-modal="true"`, not a native modal `<dialog>`: style the overlay through `DialogBackdrop` / `DrawerBackdrop`, not `::backdrop`.
- **Events bubble through the DOM** around a popup. Keep popups out of clickable cards and links.
- **Select and Combobox wrappers use plain values.** The Base UI wrappers passed whole item objects as values; ui-sdk items are `{ value, label, disabled }` and the value is `item.value` (object values need `itemToValue` / `itemToLabel`). `ComboboxChip` needs `value`; without children it renders no visible text (its label only names the chip's group), so pass `labels[index]` from `ComboboxValue`.
- **Combobox parts that stay mounted.** `ComboboxEmpty` is always rendered (it's a live region): hide it with `hidden data-empty:flex`. `ComboboxClear` unmounts on a disabled combobox, so the wrapper renders it with `keepMounted` from `ComboboxValue` while there is a value.
- **Popups close on `window-blur`**, which Base UI didn't do: focusing another window or iframe closes an open Select or Combobox.
- **No `duration-*` without a `transition-*` on popups.** `transition-property` defaults to `all`, so `duration-100` alone animates the `inset` and `--transform-origin` ui-sdk writes inline after the first frame: the popup flies in from the top left. Use `transition` (opacity, scale, translate) with `data-starting-style:` / `data-ending-style:` instead of tw-animate's `animate-in` / `animate-out`. Popover, DropdownMenu and Dialog have the same classes: fix them in phase 3.
- **`buttonVariants()` on a ui-sdk part needs `cn()`**: without tailwind-merge, `w-fit` wins over the `size-*` of icon sizes.
- **Wrappers name their own buttons.** Number input step buttons and the combobox trigger, clear and chip remove buttons take an `aria-label` from `components:numberInput.*` / `components:combobox.*`.
- **SSR** works with `renderToString`. Closed content isn't in the server HTML, and ids look like `ui-sdk-_R_0_-trigger`: never target them in CSS or tests.
