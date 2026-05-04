import type { GlobalProvider } from '@ladle/react';
import { StrictMode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import '@/styles/app.css';
import './preview.css';

import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE_KEY,
  type LanguageKey,
} from '../src/lib/i18n/constants';
import i18nGlobal from '../src/lib/i18n/index';
import { Providers } from '../src/providers';

const localeArgType = {
  defaultValue: DEFAULT_LANGUAGE_KEY,
  control: { type: 'select' as const },
  options: AVAILABLE_LANGUAGES.map(({ key }) => key),
  optionLabels: AVAILABLE_LANGUAGES.reduce<Record<string, string>>(
    (acc, { key }) => {
      acc[key] = i18nGlobal.t(`common:languages.values.${String(key)}`, {
        lng: 'en',
      });
      return acc;
    },
    {}
  ),
};

export const argTypes = {
  locale: localeArgType,
};

const LocaleSync = ({ locale }: { locale: LanguageKey }) => {
  const { i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage(locale);
    const languageConfig = AVAILABLE_LANGUAGES.find(({ key }) => key === locale);
    if (languageConfig) {
      document.documentElement.lang = languageConfig.key;
      document.documentElement.dir = languageConfig.dir ?? 'ltr';
      document.documentElement.style.fontSize = `${(languageConfig.fontScale ?? 1) * 100}%`;
    }
  }, [locale, i18n]);
  return null;
};

export const Provider: GlobalProvider = ({ children, globalState }) => {
  const locale = (globalState.control.locale?.value ?? DEFAULT_LANGUAGE_KEY) as LanguageKey;
  return (
    <Providers forcedTheme={globalState.theme === 'dark' ? 'dark' : 'light'}>
      <StrictMode>
        <LocaleSync locale={locale} />
        <div id="preview-container">{children}</div>
      </StrictMode>
    </Providers>
  );
};
