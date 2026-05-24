import {
  createRuntimeConfigUseCases,
  type RuntimeConfigSource,
} from '@/modules/runtime-config';
import { RuntimeConfigSourceEnv } from '@/modules/runtime-config/infrastructure/env/runtime-config-env';

import { createCachedFactory } from './shared/singleton';

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
export const __resetRuntimeConfigComposition = () => factory.reset();
