import { getUserLanguage } from './user-language';

export const createSsrAppHandlers = () => {
  const init = () => ({
    language: getUserLanguage(),
  });

  return { init };
};

export type SsrAppHandlers = ReturnType<typeof createSsrAppHandlers>;
