import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export const useHydrated = () => {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
};
