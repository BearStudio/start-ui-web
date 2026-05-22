import { beforeEach, describe, expect, it } from 'vitest';

import {
  __resetAccountComposition,
  __resetBookComposition,
  __resetGenreComposition,
  __resetKernelComposition,
  __resetUserComposition,
  getKernel,
  getServices,
} from '../index';

const resetComposition = () => {
  __resetKernelComposition();
  __resetBookComposition();
  __resetUserComposition();
  __resetGenreComposition();
  __resetAccountComposition();
};

describe('composition override contract', () => {
  beforeEach(() => {
    resetComposition();
  });

  it('treats direct empty kernel overrides as a fresh build', () => {
    const singleton = getKernel();
    const overridden = getKernel({});

    expect(getKernel()).toBe(singleton);
    expect(overridden).not.toBe(singleton);
  });

  it('uses singleton services with no overrides and fresh services with overrides', () => {
    const first = getServices();
    const second = getServices();
    const overridden = getServices({});

    expect(second.kernel).toBe(first.kernel);
    expect(second.book).toBe(first.book);
    expect(second.user).toBe(first.user);
    expect(second.genre).toBe(first.genre);
    expect(second.account).toBe(first.account);

    expect(overridden.kernel).not.toBe(first.kernel);
    expect(overridden.book).not.toBe(first.book);
    expect(overridden.user).not.toBe(first.user);
    expect(overridden.genre).not.toBe(first.genre);
    expect(overridden.account).not.toBe(first.account);
  });
});
