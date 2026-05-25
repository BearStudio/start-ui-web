import type { ReactNode } from 'react';
import { StrictMode, useEffect, useState } from 'react';

import type { LanguageKey } from '@/platform/lib/i18n/constants';
import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE_KEY,
} from '@/platform/lib/i18n/constants';
import i18nGlobal from '@/platform/lib/i18n/index';

import { createClientQueryClient } from '@/composition/client-query';
import { Providers } from '@/composition/providers';

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
  const [queryClient] = useState(() => createClientQueryClient());
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
    <Providers client={queryClient} forcedTheme={options?.theme ?? 'light'}>
      <StrictMode>
        <div id="preview-container">{children}</div>
      </StrictMode>
    </Providers>
  );
}
