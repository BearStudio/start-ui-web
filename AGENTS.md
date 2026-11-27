# Agent instructions

After making changes, run `pnpm lint` and fix all errors.

## Design system

UI must use the design system in `src/components/ui` and the theme in `src/styles/app.css`. [`@shadcn/lint`](https://github.com/shadcn-ui/lint) enforces it through the `shadcn/*` rules in `.oxlintrc.json`:

- Do not restyle design-system components with `className`. Use their variants and sizes. Only layout classes (margin, width, position, flex placement…) are allowed.
- Use theme tokens and scale values, not arbitrary values such as `p-[13px]` or raw colors such as `bg-[#333]`.
- Do not use inline styles. Pass dynamic values through CSS custom properties (`style={{ '--x': value }}` with `className="w-(--x)"`).

When a design needs a treatment no variant covers, add a variant in the component file in `src/components/ui` instead of overriding it at the call site.

## Tests

Vitest runs every file in one shared module graph (`isolate: false`) and in random order (`sequence.shuffle`). A test file must leave nothing behind for the next one:

- Do not use `vi.mock` on a module another test file also imports (`react-i18next`, `@/server/auth`...). It cannot apply once that module is loaded. Render through the real providers, or inject the dependency.
- Spies, mocks, stubbed env and globals are restored after each test (`restoreMocks`, `unstubEnvs`, `unstubGlobals`). Do not opt out.
- Undo anything else you change in `afterEach`: fake timers (`vi.useRealTimers()`), `document`, `window`, `localStorage`, module-level variables.
- Do not depend on another test running first, e.g. for document focus or data it created.
- Never add retries or raise a timeout to make a test pass. A test that needs one has a bug: find it.

Replay a failing order with `vitest run --sequence.seed=<seed shown in the output>`.

## ui-sdk

Before using ui-sdk (`@ui-sdk/react`, `@ui-sdk/core`), follow the `ui-sdk` skill if it is installed, and read `node_modules/@ui-sdk/react/docs/llms.txt`. To build a new component, also search `node_modules/@ui-sdk/react/docs/core.md` by heading, and read `rendering.md` in the same folder.
