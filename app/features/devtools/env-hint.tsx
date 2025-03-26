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
      className="fixed top-0 right-0 left-0 z-[9999] h-0.5"
      style={{ background: envClient.VITE_ENV_COLOR }}
    >
      <p
        className="fixed top-0 left-4 rounded-b-xs px-1 text-[0.6rem] font-bold text-black uppercase"
        style={{
          background: envClient.VITE_ENV_COLOR,
        }}
      >
        {envClient.VITE_ENV_NAME}
      </p>
    </div>
  );
};
