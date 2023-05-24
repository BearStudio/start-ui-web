import { useEffect, useState } from 'react';

/**
 * This hook is used to make sure your are on the client only
 * to prevent hydratation errors with SSR.
 * @returns boolean
 */
export const useIsClientReady = () => {
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  return isClientReady;
};
