import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { authClient } from '@/lib/auth/client';
import i18n from '@/lib/i18n';
import { AVAILABLE_LANGUAGES } from '@/lib/i18n/constants';
import { useInitTheme } from '@/lib/theme/client';

import { PageError } from '@/components/page-error';
import { PageErrorBoundary } from '@/components/page-error-boundary';

import { EnvHint, getEnvHintTitlePrefix } from '@/features/devtools/env-hint';
import { Providers } from '@/providers';
import { getUserLanguage, getUserTheme } from '@/server/utils';
import appCss from '@/styles/app.css?url';

const initApp = createServerFn({ method: 'GET' }).handler(() => {
  return {
    language: getUserLanguage(),
    theme: getUserTheme(),
  };
});

let devWarmUpDone = false;
export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  beforeLoad: async () => {
    // Warm up auth session in Dev
    // Prevent error on first load
    if (import.meta.env.DEV && !devWarmUpDone) {
      devWarmUpDone = true;
      await authClient.getSession();
    }
  },
  loader: async () => {
    // Setup language and theme in SSR to prevent hydratation errors
    if (import.meta.env.SSR) {
      const { language, theme } = await initApp();
      i18n.changeLanguage(language);
      return { theme };
    }
  },
  notFoundComponent: () => <PageError errorCode={404} />,
  errorComponent: (props) => {
    return (
      <RootDocument>
        <PageErrorBoundary {...props} />
      </RootDocument>
    );
  },
  component: RootComponent,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, viewport-fit=cover',
      },
      {
        title: `${getEnvHintTitlePrefix()} Start UI`,
      },
      {
        name: 'apple-mobile-web-app-title',
        content: 'Start UI',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'black-translucent',
      },
      {
        name: 'mobile-web-app-capable',
        content: 'yes',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/png',
        href: '/favicon-96x96.png',
        sizes: '96x96',
      },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'shortcut icon', href: '/favicon.ico' },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      { rel: 'manifest', href: '/site.webmanifest' },
    ],
  }),
});

function RootComponent() {
  return (
    <RootDocument>
      <Providers>
        <Outlet />
        <ReactQueryDevtools initialIsOpen={false} />
      </Providers>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { i18n } = useTranslation();
  const data = Route.useLoaderData();
  const { theme } = useInitTheme(data?.theme ?? null);

  const languageConfig = AVAILABLE_LANGUAGES.find(
    ({ key }) => key === i18n.language
  );

  return (
    <html
      className={theme}
      lang={i18n.language}
      dir={languageConfig?.dir ?? 'ltr'}
      style={{
        fontSize: languageConfig?.fontScale
          ? `${languageConfig.fontScale * 100}%`
          : undefined,
      }}
    >
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-dvh flex-col">
        {children}
        <EnvHint />
        <Scripts />
      </body>
    </html>
  );
}
