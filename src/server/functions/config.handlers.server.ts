import { envClient } from '@/env/client';
import { env as kernelEnv } from '@/modules/kernel/infrastructure/config/env';

const env = () => {
  return {
    name: envClient.VITE_ENV_NAME,
    color: envClient.VITE_ENV_COLOR,
    emoji: envClient.VITE_ENV_EMOJI,
    isDemo: envClient.VITE_IS_DEMO,
    isDev: import.meta.env.DEV,
  };
};

const devtools = () => {
  return {
    maildevIframeSrc:
      import.meta.env.DEV && kernelEnv.DOCKER_MAILDEV_UI_PORT
        ? `http://localhost:${kernelEnv.DOCKER_MAILDEV_UI_PORT}/#/`
        : null,
  };
};

export type ConfigHandlers = {
  env: typeof env;
  devtools: typeof devtools;
};

export const handlers: ConfigHandlers = {
  env,
  devtools,
};
