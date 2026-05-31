import { createRuntimeConfigUseCases, type RuntimeConfigSource } from './index';
import { RuntimeConfigSourceEnv } from './infrastructure/env/runtime-config-env';

function createCachedFactory<T, O>(build: (overrides?: O) => T) {
  let instance: T | undefined;

  return {
    get(overrides?: O) {
      if (overrides !== undefined) return build(overrides);
      return (instance ??= build());
    },
    reset() {
      instance = undefined;
    },
  };
}

export type RuntimeConfigOverrides = {
  source?: RuntimeConfigSource;
};

const buildRuntimeConfigUseCases = (overrides?: RuntimeConfigOverrides) =>
  createRuntimeConfigUseCases({
    source: overrides?.source ?? new RuntimeConfigSourceEnv(),
  });

const factory = createCachedFactory(buildRuntimeConfigUseCases);

export const getRuntimeConfigUseCases = (overrides?: RuntimeConfigOverrides) =>
  factory.get(overrides);

/** Test-only. */
export const __resetRuntimeConfigService = () => factory.reset();
