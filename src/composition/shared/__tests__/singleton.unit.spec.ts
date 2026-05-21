import { describe, expect, it, vi } from 'vitest';

import { createCachedFactory } from '../singleton';

describe('createCachedFactory', () => {
  it('caches the no-overrides path and rebuilds when overrides are present', () => {
    const build = vi.fn(() => ({}));
    const factory = createCachedFactory(build);

    const first = factory(false);
    const second = factory(false);
    const overridden = factory(true);

    expect(first).toBe(second);
    expect(overridden).not.toBe(first);
    expect(build).toHaveBeenCalledTimes(2);
  });
});
