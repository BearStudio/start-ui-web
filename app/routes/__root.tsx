import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { getCookie } from 'vinxi/http';

import i18n from '@/lib/i18n';
import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE_KEY,
} from '@/lib/i18n/constants';

import { Providers } from '@/providers';
import appCss from '@/styles/app.css?url';

const getI18nCookie = createServerFn({ method: 'GET' }).handler(() => {
  const cookieValue = getCookie('i18next');
  return AVAILABLE_LANGUAGES.some((l) => l.key === cookieValue)
    ? cookieValue
    : DEFAULT_LANGUAGE_KEY;
});

export const Route = createRootRoute({
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
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
  loader: async () => {
    if (import.meta.env.SSR) {
      i18n.changeLanguage(await getI18nCookie());
    }
  },
});

function RootComponent() {
  return (
    <Providers>
      <RootDocument>
        <Outlet />
        <ReactQueryDevtools initialIsOpen={false} />
      </RootDocument>
    </Providers>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { i18n } = useTranslation();
  const languageConfig = AVAILABLE_LANGUAGES.find(
    ({ key }) => key === i18n.language
  );

  return (
    <html
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
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
