import { useLayoutEffect, useRef } from 'react';
import { create } from 'zustand';

type ShouldShowNavMode = 'all' | 'desktop-only' | 'none';
type ShouldShowNavRequestId = symbol;

interface ShouldShowNavState {
  mode: ShouldShowNavMode;
  release: (requestId: ShouldShowNavRequestId) => void;
  request: (
    requestId: ShouldShowNavRequestId,
    shouldShowNav: ShouldShowNavMode
  ) => void;
  requests: Map<ShouldShowNavRequestId, ShouldShowNavMode>;
  reset: () => void;
}

const resolveShouldShowNavMode = (
  requests: Map<ShouldShowNavRequestId, ShouldShowNavMode>
): ShouldShowNavMode => Array.from(requests.values()).at(-1) ?? 'all';

export const useShouldShowNavStore = create<ShouldShowNavState>()((set) => ({
  mode: 'all',
  release: (requestId) => {
    set((state) => {
      const requests = new Map(state.requests);
      requests.delete(requestId);
      return {
        mode: resolveShouldShowNavMode(requests),
        requests,
      };
    });
  },
  request: (requestId, shouldShowNav) => {
    set((state) => {
      const requests = new Map(state.requests);
      requests.delete(requestId);
      requests.set(requestId, shouldShowNav);
      return {
        mode: resolveShouldShowNavMode(requests),
        requests,
      };
    });
  },
  requests: new Map(),
  reset: () => {
    set({
      mode: 'all',
      requests: new Map(),
    });
  },
}));

export const useShouldShowNav = (shouldShowNav: ShouldShowNavMode) => {
  const requestIdRef = useRef<ShouldShowNavRequestId | null>(null);
  requestIdRef.current ??= Symbol('should-show-nav');
  const release = useShouldShowNavStore((s) => s.release);
  const request = useShouldShowNavStore((s) => s.request);
  useLayoutEffect(() => {
    const requestId = requestIdRef.current;
    if (!requestId) return;

    request(requestId, shouldShowNav);
    return () => release(requestId);
  }, [release, request, shouldShowNav]);
};
