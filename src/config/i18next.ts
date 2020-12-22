import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '@/i18n/en';
import frTranslations from '@/i18n/fr';

const translations = {
  en: enTranslations,
  fr: frTranslations,
}

i18n
  // .use(httpBackend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    lng: "en",
    resources: translations,

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false // react already safes from xss
    },
  });

export default i18n;