import { createServerFn } from '@tanstack/react-start';

import { getTelemetry } from '@/platform/telemetry';

export const initSsrApp = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { createSsrAppHandlers } =
      await import('./transport/tanstack/ssr-app-init');

    return getTelemetry().startSpan(
      {
        attributes: {
          'operation.name': 'kernel.initSsrApp',
          'operation.type': 'server_function',
        },
        name: 'kernel.initSsrApp',
        op: 'server.function',
      },
      () => createSsrAppHandlers().init()
    );
  }
);
