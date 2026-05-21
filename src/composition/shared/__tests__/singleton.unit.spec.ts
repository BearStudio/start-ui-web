import { describe, expect, it, vi } from 'vitest';

import { hasDefinedOverrides } from '../overrides';
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

  it('caches undefined values and ignores undefined override values', () => {
    const build = vi.fn(() => undefined);
    const factory = createCachedFactory(build);

    factory(false);
    factory(false);

    expect(build).toHaveBeenCalledTimes(1);
    expect(hasDefinedOverrides({ logger: undefined })).toBe(false);
    expect(hasDefinedOverrides({ logger: {} })).toBe(true);
  });
});
