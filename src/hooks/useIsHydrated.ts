import { useEffect, useState } from 'react';

/**
 * This hook is used to make sure your are on the client only
 * to prevent hydratation errors with SSR.
 * @returns boolean
 */
export const useIsHydrated = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    // TODO @eslint-react rule
    // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
    setIsHydrated(true);
  }, []);
  return isHydrated;
};
