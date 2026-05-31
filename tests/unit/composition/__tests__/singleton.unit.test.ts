import { describe, expect, it, vi } from 'vitest';

import { createCachedFactory } from '@/composition/shared/singleton';

describe('createCachedFactory', () => {
  it('returns the same singleton when overrides are not provided', () => {
    const build = vi.fn(() => ({}));
    const factory = createCachedFactory(build);

    const first = factory.get();
    const second = factory.get();

    expect(first).toBe(second);
    expect(build).toHaveBeenCalledTimes(1);
  });

  it('returns fresh instances and forwards overrides when overrides are provided', () => {
    const build = vi.fn((overrides?: { flag?: boolean }) => ({ overrides }));
    const factory = createCachedFactory(build);

    const first = factory.get({ flag: false });
    const second = factory.get({ flag: false });

    expect(first).not.toBe(second);
    expect(build).toHaveBeenNthCalledWith(1, { flag: false });
    expect(build).toHaveBeenNthCalledWith(2, { flag: false });
  });

  it('treats an empty object as an override', () => {
    const build = vi.fn((overrides?: object) => ({ overrides }));
    const factory = createCachedFactory(build);
    const singleton = factory.get();

    const overridden = factory.get({});

    expect(overridden).not.toBe(singleton);
    expect(build).toHaveBeenLastCalledWith({});
  });

  it('rebuilds the singleton after reset', () => {
    const build = vi.fn(() => ({}));
    const factory = createCachedFactory(build);

    const first = factory.get();
    factory.reset();
    const second = factory.get();

    expect(second).not.toBe(first);
    expect(build).toHaveBeenCalledTimes(2);
  });
});
