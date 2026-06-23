/// <reference types="vite/client" />
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouteContext,
  useRouter,
} from '@tanstack/react-router';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { getPageTitle } from '@/platform/lib/get-page-title';
import i18n from '@/platform/lib/i18n';
import { AVAILABLE_LANGUAGES } from '@/platform/lib/i18n/constants';

import { PageError } from '@/platform/components/errors/page-error';
import { RouteError } from '@/platform/components/errors/route-error';

import {
  EnvHint,
  getEnvHintTitlePrefix,
  TanStackDevtoolsPanel,
} from '@/app/devtools/presentation';
import { Providers } from '@/composition/providers';
import { initSsrApp } from '@/modules/kernel/server';
import { createCspNonceBridgeScript } from '@/platform/http/csp-nonce';
import type { RouterContext } from '@/platform/router/context';
import { observedLoader } from '@/platform/router/route-observability';
import appCss from '@/platform/styles/app.css?url';

export const Route = createRootRouteWithContext<RouterContext>()({
  loader: observedLoader('__root__', async () => {
    // Setup language and theme in SSR to prevent hydratation errors
    if (import.meta.env.SSR) {
      const { language } = await initSsrApp();
      await i18n.changeLanguage(language);
    }
    return null;
  }),
  notFoundComponent: () => <PageError type="404" />,
  errorComponent: ({ error }) => <RootErrorBoundary error={error} />,
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
        title: getPageTitle(undefined, getEnvHintTitlePrefix()),
      },
      {
        name: 'apple-mobile-web-app-title',
        content: getPageTitle(undefined, getEnvHintTitlePrefix()),
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

function RootErrorBoundary({ error }: Readonly<{ error: unknown }>) {
  return (
    <RootDocument>
      <RouteError error={error} routeId="__root__" />
    </RootDocument>
  );
}

function RootComponent() {
  const { queryClient } = useRouteContext({ from: Route.id });
  const cspNonce = useRouter().options.ssr?.nonce;

  return (
    <RootDocument>
      <Providers client={queryClient} cspNonce={cspNonce}>
        <Outlet />
        <TanStackDevtoolsPanel />
      </Providers>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { i18n } = useTranslation();

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
        <CspNonceTags />
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

function CspNonceTags() {
  const nonce = useRouter().options.ssr?.nonce;

  return nonce ? (
    <>
      <meta
        property="csp-nonce"
        content={nonce}
        nonce={nonce}
        suppressHydrationWarning
      />
      <script
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: createCspNonceBridgeScript(nonce) }}
      />
    </>
  ) : null;
}
