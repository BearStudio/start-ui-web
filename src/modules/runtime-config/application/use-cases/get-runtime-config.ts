import type { RuntimeConfig } from '../../domain/runtime-config';
import type { RuntimeConfigUseCaseDeps } from './types';

export function getRuntimeConfig(
  deps: RuntimeConfigUseCaseDeps
): RuntimeConfig {
  return deps.source.read();
}
