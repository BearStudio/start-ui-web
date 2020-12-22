import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import httpBackend from 'i18next-http-backend';


i18n
  .use(httpBackend)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    lng: "en",

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

  export default i18n;