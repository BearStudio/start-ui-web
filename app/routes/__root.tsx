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
import { getCookie } from 'vinxi/http';
import { z } from 'zod';

import i18n from '@/lib/i18n';
import { AVAILABLE_LANGUAGES } from '@/lib/i18n/constants';
import { useInitTheme } from '@/lib/theme/client';
import { THEME_COOKIE_NAME, themes } from '@/lib/theme/config';

import { Providers } from '@/providers';
import { getUserLanguage } from '@/server/i18n';
import appCss from '@/styles/app.css?url';

const initApp = createServerFn({ method: 'GET' }).handler(() => {
  return {
    language: getUserLanguage(),
    theme: z
      .enum(themes)
      .nullable()
      .catch(null)
      .parse(getCookie(THEME_COOKIE_NAME)),
  };
});

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  loader: async () => {
    const { language, theme } = await initApp();
    if (import.meta.env.SSR) {
      i18n.changeLanguage(language);
    }
    return { theme };
  },
  component: RootComponent,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Start UI [web]',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'black-translucent',
      },
      {
        name: 'mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'msapplication-TileColor',
        content: '#000',
      },
      {
        name: 'theme-color',
        content: '#000',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest' },
      {
        rel: 'mask-icon',
        href: '/safari-pinned-tab.svg',
        color: '#000',
      },
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
  const { theme } = useInitTheme(data.theme);

  const languageConfig = AVAILABLE_LANGUAGES.find(
    ({ key }) => key === i18n.language
  );

  return (
    <html
      lang={i18n.language}
      dir={languageConfig?.dir ?? 'ltr'}
      className={theme}
      style={{
        fontSize: languageConfig?.fontScale
          ? `${languageConfig.fontScale * 100}%`
          : undefined,
      }}
    >
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
