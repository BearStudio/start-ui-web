import { envClient } from '@/platform/env/client';

export const getEnvHintTitlePrefix = () => {
  if (envClient.VITE_VISUAL_TEST) return '';
  if (envClient.VITE_ENV_EMOJI) return envClient.VITE_ENV_EMOJI;
  if (envClient.VITE_ENV_NAME) return `[${envClient.VITE_ENV_NAME}]`;
  return '';
};
