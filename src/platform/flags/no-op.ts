import type { FlagsAdapter } from './types';

/**
 * Default flags adapter — every flag resolves to `false`. Replace in
 * composition when a real provider is wired up.
 */
export const createNoOpFlags = (): FlagsAdapter => ({
  isEnabled: () => false,
});
