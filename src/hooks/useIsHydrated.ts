import { useSyncExternalStore } from 'react';

// Stable function that do nothing
const doNothing = () => () => undefined;

/**
 * This hook is used to make sure your are on the client only
 * to prevent hydratation errors with SSR.
 * @returns boolean
 */
export const useIsHydrated = () => {
  return useSyncExternalStore(
    doNothing,
    () => true,
    () => false
  );
};
