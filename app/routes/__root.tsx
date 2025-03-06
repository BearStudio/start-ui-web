import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import type { ReactNode } from 'react';

import i18n from '@/lib/i18n/client';
import { AVAILABLE_LANGUAGES } from '@/lib/i18n/constants';

import { Providers } from '@/providers';
import appCss from '@/styles/app.css?url';

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
  const languageConfig = AVAILABLE_LANGUAGES.find(
    ({ key }) => key === i18n.language
  );
  return (
    <html
      lang={i18n.language}
      dir={languageConfig?.dir ?? 'ltr'}
      suppressHydrationWarning
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
