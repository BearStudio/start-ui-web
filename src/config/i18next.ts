import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/en';
import fr from '@/locales/fr';

i18n.use(initReactI18next).init({
  ns: Object.keys(en),
  defaultNS: 'common',
  resources: { en, fr },
  lng: 'en',
  fallbackLng: 'en',

  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

export default i18n;
