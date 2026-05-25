import type { RuntimeConfigUseCaseDeps } from './types';
import type { RuntimeConfig } from '../../domain/runtime-config';

export function getRuntimeConfig(
  deps: RuntimeConfigUseCaseDeps
): RuntimeConfig {
  return deps.source.read();
}
