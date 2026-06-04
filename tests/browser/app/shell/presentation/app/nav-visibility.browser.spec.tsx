import { afterEach, expect, test } from 'vitest';
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
