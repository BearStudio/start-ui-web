import dayjs from 'dayjs';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { z } from 'zod';
import { makeZodI18nMap } from 'zod-i18n-map';

import { i18nConfig } from '@/lib/i18n/config';
import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE_KEY,
} from '@/lib/i18n/constants';
import { isBrowser } from '@/lib/ssr';

dayjs.locale(DEFAULT_LANGUAGE_KEY);

i18n.use(LanguageDetector).use(initReactI18next).init(i18nConfig);

const loadLanguage = (langKey) => {
  const language = AVAILABLE_LANGUAGES.find(({ key }) => key === langKey);
  dayjs.locale(langKey);
  z.setErrorMap(makeZodI18nMap());
  if (isBrowser) {
    document.documentElement.lang = langKey;
    document.documentElement.dir = language?.dir ?? 'ltr';
    document.documentElement.style.fontSize = language?.fontScale
      ? `${(language?.fontScale ?? 1) * 100}%`
      : '';
  }
};

loadLanguage(i18n.language);
i18n.on('languageChanged', (langKey) => loadLanguage(langKey));

export default i18n;
