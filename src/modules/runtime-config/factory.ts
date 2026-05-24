import { getRuntimeConfig } from './application/use-cases/get-runtime-config';
import type { RuntimeConfigUseCaseDeps } from './application/use-cases/types';

export function createRuntimeConfigUseCases(deps: RuntimeConfigUseCaseDeps) {
  return {
    get: () => getRuntimeConfig(deps),
  };
}

export type RuntimeConfigUseCases = ReturnType<
  typeof createRuntimeConfigUseCases
>;
