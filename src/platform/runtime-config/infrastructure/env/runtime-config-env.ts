import { envClient } from '@/platform/env/client';

import type { RuntimeConfigSource } from '../../application/ports/runtime-config-source';
import type { RuntimeConfig } from '../../domain/runtime-config';

export class RuntimeConfigSourceEnv implements RuntimeConfigSource {
  read(): RuntimeConfig {
    return {
      name: envClient.VITE_ENV_NAME,
      color: envClient.VITE_ENV_COLOR,
      emoji: envClient.VITE_ENV_EMOJI,
      isDemo: envClient.VITE_IS_DEMO,
      isDev: envClient.DEV,
    };
  }
}
