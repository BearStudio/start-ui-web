import { beforeEach, describe, expect, it } from 'vitest';

import type { RuntimeConfigSource } from '@/platform/runtime-config';
import {
  __resetRuntimeConfigService,
  getRuntimeConfigUseCases,
} from '@/platform/runtime-config/service';

describe('runtime-config service', () => {
  beforeEach(() => {
    __resetRuntimeConfigService();
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
    __resetRuntimeConfigService();
    const second = getRuntimeConfigUseCases();

    expect(second).not.toBe(first);
  });
});
