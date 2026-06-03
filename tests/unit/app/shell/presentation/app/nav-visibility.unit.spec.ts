import { afterEach, describe, expect, it } from 'vitest';

import { useShouldShowNavStore } from '@/app/shell/presentation/app/nav-visibility';

describe('useShouldShowNavStore', () => {
  afterEach(() => {
    useShouldShowNavStore.getState().reset();
  });

  it('restores the previous active request when the latest request is released', () => {
    const firstRequest = Symbol('first-nav-request');
    const secondRequest = Symbol('second-nav-request');

    useShouldShowNavStore.getState().request(firstRequest, 'desktop-only');
    useShouldShowNavStore.getState().request(secondRequest, 'none');

    expect(useShouldShowNavStore.getState().mode).toBe('none');

    useShouldShowNavStore.getState().release(secondRequest);

    expect(useShouldShowNavStore.getState().mode).toBe('desktop-only');

    useShouldShowNavStore.getState().release(firstRequest);

    expect(useShouldShowNavStore.getState().mode).toBe('all');
  });
});
