import { afterEach, expect, test, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

import {
  useShouldShowNav,
  useShouldShowNavStore,
} from '@/app/shell/presentation/app/nav-visibility';

type ShouldShowNavMode = Parameters<typeof useShouldShowNav>[0];

const useObservedNavMode = (shouldShowNav: ShouldShowNavMode) => {
  useShouldShowNav(shouldShowNav);
  return useShouldShowNavStore((s) => s.mode);
};

const useObservedNavSnapshot = (shouldShowNav: ShouldShowNavMode) => {
  useShouldShowNav(shouldShowNav);
  const mode = useShouldShowNavStore((s) => s.mode);
  const release = useShouldShowNavStore((s) => s.release);

  return { mode, release };
};

afterEach(() => {
  useShouldShowNavStore.getState().reset();
});

test('updates the active request without temporarily releasing nav state', async () => {
  const observedModes: ShouldShowNavMode[] = [];
  const unsubscribe = useShouldShowNavStore.subscribe((state) => {
    observedModes.push(state.mode);
  });

  try {
    const view = await renderHook<
      { shouldShowNav: ShouldShowNavMode },
      ShouldShowNavMode
    >((props) => useObservedNavMode(props!.shouldShowNav), {
      initialProps: { shouldShowNav: 'desktop-only' as ShouldShowNavMode },
    });

    expect(view.result.current).toBe('desktop-only');

    observedModes.length = 0;

    await view.rerender({ shouldShowNav: 'none' });

    expect(view.result.current).toBe('none');

    expect(observedModes).toEqual(['none']);
  } finally {
    unsubscribe();
  }
});

test('keeps the active request when release action identity changes', async () => {
  const originalRelease = useShouldShowNavStore.getState().release;
  const nextRelease = vi.fn(
    (requestId: Parameters<typeof originalRelease>[0]) => {
      originalRelease(requestId);
    }
  );

  try {
    const view = await renderHook<
      { shouldShowNav: ShouldShowNavMode },
      ReturnType<typeof useObservedNavSnapshot>
    >((props) => useObservedNavSnapshot(props!.shouldShowNav), {
      initialProps: { shouldShowNav: 'desktop-only' as ShouldShowNavMode },
    });

    expect(view.result.current.mode).toBe('desktop-only');

    useShouldShowNavStore.setState({ release: nextRelease });

    await vi.waitFor(() => {
      expect(view.result.current.release).toBe(nextRelease);
    });

    expect(view.result.current.mode).toBe('desktop-only');
    expect(useShouldShowNavStore.getState().mode).toBe('desktop-only');

    view.unmount();

    expect(nextRelease).toHaveBeenCalledTimes(1);
    expect(useShouldShowNavStore.getState().mode).toBe('all');
  } finally {
    useShouldShowNavStore.setState({ release: originalRelease });
  }
});
