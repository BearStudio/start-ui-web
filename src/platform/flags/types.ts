/**
 * Feature-flag contract consumed by routes, server functions, and components.
 *
 * Today the only implementation is the no-op default — the project does not
 * use a flag provider yet. The slot exists so flag-driven rendering can be
 * added later without threading a new dependency through every loader.
 *
 * When a provider is introduced (OpenFeature, LaunchDarkly, Unleash, etc.),
 * implement this interface in `src/composition/flags.ts` and swap it into the
 * router context in `src/router.tsx`.
 */
export interface FlagsAdapter {
  isEnabled(flag: string, context?: { userId?: string }): boolean;
}
