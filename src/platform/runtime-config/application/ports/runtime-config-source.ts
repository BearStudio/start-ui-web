import type { RuntimeConfig } from '../../domain/runtime-config';

export interface RuntimeConfigSource {
  read(): RuntimeConfig;
}
