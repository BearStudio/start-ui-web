import { envClient } from '@/platform/env/client';

const env = () => {
  return {
    name: envClient.VITE_ENV_NAME,
    color: envClient.VITE_ENV_COLOR,
    emoji: envClient.VITE_ENV_EMOJI,
    isDemo: envClient.VITE_IS_DEMO,
    isDev: import.meta.env.DEV,
  };
};

export type ConfigHandlers = {
  env: typeof env;
};

export const handlers: ConfigHandlers = {
  env,
};
