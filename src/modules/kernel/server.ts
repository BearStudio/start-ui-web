import { createServerFn } from '@tanstack/react-start';

export {
  isServerFnError,
  ServerFnError,
  type ServerFnErrorCode,
  type ServerFnErrorData,
} from './client';
export { ConfigurationError } from './domain/errors/configuration-error';
export { DEMO_MODE_ERROR } from './domain/errors/demo-mode';
export { IdValidationError } from './domain/errors/id-validation-error';

export const initSsrApp = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { createSsrAppHandlers } =
      await import('./transport/tanstack/ssr-app-init');

    return createSsrAppHandlers().init();
  }
);
