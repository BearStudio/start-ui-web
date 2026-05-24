import { beforeEach, describe, expect, it } from 'vitest';

import type { RuntimeConfigSource } from '@/modules/runtime-config';

import {
  __resetRuntimeConfigComposition,
  getRuntimeConfigUseCases,
} from '../runtime-config';

describe('runtime-config composition', () => {
  beforeEach(() => {
    __resetRuntimeConfigComposition();
  });

  it('returns a singleton when overrides are not provided', () => {
    const first = getRuntimeConfigUseCases();
    const second = getRuntimeConfigUseCases();

    expect(second).toBe(first);
  });

  it('returns fresh use cases when a source override is provided', () => {
    const source: RuntimeConfigSource = {
      read: () => ({
        name: 'TEST',
        isDemo: false,
        isDev: true,
      }),
    };

    const first = getRuntimeConfigUseCases({ source });
    const second = getRuntimeConfigUseCases({ source });

    expect(second).not.toBe(first);
    expect(first.get()).toEqual({
      name: 'TEST',
      isDemo: false,
      isDev: true,
    });
  });

  it('rebuilds the singleton after reset', () => {
    const first = getRuntimeConfigUseCases();
    __resetRuntimeConfigComposition();
    const second = getRuntimeConfigUseCases();

    expect(second).not.toBe(first);
  });
});
