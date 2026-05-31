import { describe, expect, it } from 'vitest';

import type { RuntimeConfigSource } from '@/platform/runtime-config/application/ports/runtime-config-source';
import type { RuntimeConfig } from '@/platform/runtime-config/domain/runtime-config';
import { createRuntimeConfigUseCases } from '@/platform/runtime-config/factory';

const config: RuntimeConfig = {
  name: 'TEST',
  color: 'gold',
  emoji: 'T',
  isDemo: false,
  isDev: true,
};

describe('runtime-config use cases', () => {
  it('returns whatever the source provides', () => {
    const source: RuntimeConfigSource = { read: () => config };
    const useCases = createRuntimeConfigUseCases({ source });

    expect(useCases.get()).toEqual(config);
    expect(Object.keys(useCases.get()).sort()).toEqual([
      'color',
      'emoji',
      'isDemo',
      'isDev',
      'name',
    ]);
  });

  it('passes through subsequent source reads without internal caching', () => {
    let calls = 0;
    const source: RuntimeConfigSource = {
      read: () => {
        calls += 1;
        return { ...config, isDemo: calls % 2 === 0 };
      },
    };
    const useCases = createRuntimeConfigUseCases({ source });

    expect(useCases.get().isDemo).toBe(false);
    expect(useCases.get().isDemo).toBe(true);
    expect(calls).toBe(2);
  });
});
