import { envClient } from '@/platform/env/client';
import { isDevEnvironment } from '@/platform/env/config';

export function shouldRenderTanStackDevtools() {
  const envName = envClient.VITE_ENV_NAME?.toLowerCase();

  return (
    isDevEnvironment() &&
    !envClient.VITE_VISUAL_TEST &&
    envName !== 'test' &&
    envName !== 'tests'
  );
}
