# Agent instructions

After making changes, run `pnpm lint` and fix all errors.

## Design system

UI must use the design system in `src/components/ui` and the theme in `src/styles/app.css`. [`@shadcn/lint`](https://github.com/shadcn-ui/lint) enforces it through the `shadcn/*` rules in `.oxlintrc.json`:

- Do not restyle design-system components with `className`. Use their variants and sizes. Only layout classes (margin, width, position, flex placement…) are allowed.
- Use theme tokens and scale values, not arbitrary values such as `p-[13px]` or raw colors such as `bg-[#333]`.
- Do not use inline styles. Pass dynamic values through CSS custom properties (`style={{ '--x': value }}` with `className="w-(--x)"`).

When a design needs a treatment no variant covers, add a variant in the component file in `src/components/ui` instead of overriding it at the call site.
