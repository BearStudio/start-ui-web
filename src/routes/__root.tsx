/// <reference types="vite/client" />
import { TanStackDevtools } from '@tanstack/react-devtools';
import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { createServerFn } from '@tanstack/react-start';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { getPageTitle } from '@/lib/get-page-title';
import i18n, { syncLanguage } from '@/lib/i18n';
import { AVAILABLE_LANGUAGES } from '@/lib/i18n/constants';

import { PageError } from '@/components/errors/page-error';

import { MailDevDevtoolPanel } from '@/devtools/maildev';
import { EnvHint } from '@/features/devtools/env-hint';
import { Providers } from '@/providers';
import { getUserLanguage } from '@/server/utils';
import appCss from '@/styles/app.css?url';

const initSsrApp = createServerFn({ method: 'GET' }).handler(() => {
  return {
    language: getUserLanguage(),
  };
});

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  loader: async () => {
    // Setup language and theme in SSR to prevent hydratation errors
    if (import.meta.env.SSR) {
      const { language } = await initSsrApp();
      i18n.changeLanguage(language);
    }
  },
  notFoundComponent: () => <PageError type="404" />,
  errorComponent: () => {
    return (
      <RootDocument>
        <PageError type="error-boundary" />
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
        title: getPageTitle(),
      },
      {
        name: 'apple-mobile-web-app-title',
        content: getPageTitle(),
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
        <TanStackDevtools
          config={{
            openHotkey: [], // Disable keyboard shortcut
          }}
          plugins={[
            { name: 'Tanstack Query', render: <ReactQueryDevtoolsPanel /> },
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: 'MailDev iframe',
              render: <MailDevDevtoolPanel />,
            },
          ]}
        />
      </Providers>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { i18n } = useTranslation();
  syncLanguage(i18n.language);

  const languageConfig = AVAILABLE_LANGUAGES.find(
    ({ key }) => key === i18n.language
  );

  return (
    <html
      suppressHydrationWarning
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
