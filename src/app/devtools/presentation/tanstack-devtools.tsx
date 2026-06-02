import { type ComponentType, lazy, Suspense } from 'react';

import { envClient, isDevEnvironment } from '@/platform/env/config';

export function shouldRenderTanStackDevtools() {
  const envName = envClient.VITE_ENV_NAME?.toLowerCase();

  return (
    import.meta.env.DEV &&
    isDevEnvironment() &&
    !envClient.VITE_VISUAL_TEST &&
    envName !== 'test' &&
    envName !== 'tests'
  );
}

type LazyDevtoolsModule = {
  default: ComponentType;
};

const LazyTanStackDevtools = lazy(async (): Promise<LazyDevtoolsModule> => {
  if (!import.meta.env.DEV) {
    return { default: () => null };
  }

  const [
    { TanStackDevtools },
    { ReactQueryDevtoolsPanel },
    { TanStackRouterDevtoolsPanel },
  ] = await Promise.all([
    import('@tanstack/react-devtools'),
    import('@tanstack/react-query-devtools'),
    import('@tanstack/react-router-devtools'),
  ]);

  return {
    default: function TanStackDevtoolsLoader() {
      return (
        <TanStackDevtools
          config={{
            openHotkey: [],
          }}
          plugins={[
            { name: 'Tanstack Query', render: <ReactQueryDevtoolsPanel /> },
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      );
    },
  };
});

export function TanStackDevtoolsPanel() {
  if (!shouldRenderTanStackDevtools()) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <LazyTanStackDevtools />
    </Suspense>
  );
}
