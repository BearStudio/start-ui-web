import { createServerFn } from '@tanstack/react-start';

export const initSsrApp = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { createSsrAppHandlers } =
      await import('./transport/tanstack/ssr-app-init');

    return createSsrAppHandlers().init();
  }
);
