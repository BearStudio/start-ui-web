import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '@/i18n/en';
import fr from '@/i18n/fr';

export const resources = {
  en,
  fr,
} as const;

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    ns: Object.keys(resources.en),
    defaultNS: 'common',
    resources,
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false // react already safes from xss
    },
  });

export default i18n;
