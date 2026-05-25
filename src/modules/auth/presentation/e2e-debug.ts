import { envClient } from '@/platform/env/client';

type AuthE2eDebugFields = Record<string, unknown>;

export const authE2eDebug = (
  event: string,
  fields: AuthE2eDebugFields = {}
) => {
  if (envClient.VITE_ENV_NAME !== 'tests') {
    return;
  }

  console.info(
    `[auth-e2e] ${event}`,
    JSON.stringify({
      at: new Date().toISOString(),
      event,
      ...fields,
    })
  );
};
