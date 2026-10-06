import { envClient } from '@/env/client';

export const getEnvHintTitlePrefix = () => {
  if (envClient.VITE_ENV_EMOJI) return `${envClient.VITE_ENV_EMOJI} `;
  if (envClient.VITE_ENV_NAME) return `[${envClient.VITE_ENV_NAME}] `;
  return '';
};

export const EnvHint = () => {
  if (!envClient.VITE_ENV_NAME) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] border-t-4 border-(--env-color)"
      style={{ '--env-color': envClient.VITE_ENV_COLOR } as React.CSSProperties}
    >
      <p className="fixed top-0 left-4 rounded-b-xs bg-(--env-color) px-1 text-2xs font-bold text-black uppercase">
        {envClient.VITE_ENV_NAME}
      </p>
    </div>
  );
};
