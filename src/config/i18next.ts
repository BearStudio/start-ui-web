import dayjs from 'dayjs';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LANGUAGE, RTL_LANGUAGES } from '@/constants/i18n';
import * as locales from '@/locales';
import { isBrowser } from '@/utils/ssr';

i18n.use(initReactI18next).init({
  defaultNS: 'common',
  ns: Object.keys(locales[DEFAULT_LANGUAGE]),
  resources: locales,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,

  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

i18n.on('languageChanged', (langKey) => {
  dayjs.locale(langKey);
  if (isBrowser) {
    document.documentElement.lang = langKey;
    document.documentElement.dir = RTL_LANGUAGES.includes(langKey)
      ? 'rtl'
      : 'ltr';
  }
});

export default i18n;
