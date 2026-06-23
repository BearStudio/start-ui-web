import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { StrictMode, useEffect, useState } from 'react';
import '@fontsource-variable/inter';
import '@/platform/lib/temporal/polyfill';

import type { LanguageKey } from '@/platform/lib/i18n/constants';
import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE_KEY,
} from '@/platform/lib/i18n/constants';
import i18nGlobal from '@/platform/lib/i18n/index';
import { QueryClientProvider } from '@/platform/lib/tanstack-query/provider';
import { createAppQueryClient } from '@/platform/lib/tanstack-query/query-client';

import { Sonner } from '@/platform/components/ui/sonner';

type CosmosFixtureOptions = {
  locale?: LanguageKey;
  theme?: 'dark' | 'light';
};

type CosmosDecoratorProps = {
  children: ReactNode;
  options?: CosmosFixtureOptions;
};

export default function CosmosDecorator({
  children,
  options,
}: CosmosDecoratorProps) {
  const [queryClient] = useState(() => createAppQueryClient());
  const locale = options?.locale ?? DEFAULT_LANGUAGE_KEY;

  useEffect(() => {
    void i18nGlobal.changeLanguage(locale);

    const languageConfig = AVAILABLE_LANGUAGES.find(
      ({ key }) => key === locale
    );

    if (languageConfig) {
      document.documentElement.lang = languageConfig.key;
      document.documentElement.dir = languageConfig.dir ?? 'ltr';
      document.documentElement.style.fontSize = `${(languageConfig.fontScale ?? 1) * 100}%`;
    }
  }, [locale]);

  return (
    <ThemeProvider
      attribute="class"
      storageKey="theme"
      disableTransitionOnChange
      forcedTheme={options?.theme ?? 'light'}
    >
      <QueryClientProvider client={queryClient}>
        <StrictMode>
          <div id="preview-container">{children}</div>
        </StrictMode>
        <Sonner />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
