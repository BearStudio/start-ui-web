import { createServerFn } from '@tanstack/react-start';

import { createSsrAppHandlers } from './transport/tanstack/ssr-app-init';

export {
  isServerFnError,
  ServerFnError,
  type ServerFnErrorCode,
  type ServerFnErrorData,
} from './client';
export { DEMO_MODE_ERROR } from './domain/errors/demo-mode';
export { getUserLanguage } from './transport/tanstack/user-language';

const ssrAppHandlers = createSsrAppHandlers();

export const initSsrApp = createServerFn({ method: 'GET' }).handler(() =>
  ssrAppHandlers.init()
);
