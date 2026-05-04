import { envClient } from '@/env/client';

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
      // eslint-disable-next-line no-process-env
      import.meta.env.DEV && process.env.DOCKER_MAILDEV_UI_PORT
        ? // eslint-disable-next-line no-process-env
          `http://localhost:${process.env.DOCKER_MAILDEV_UI_PORT}/#/`
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
