import dayjs from 'dayjs';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { z } from 'zod';
import { makeZodI18nMap } from 'zod-i18n-map';

import { i18nConfig } from '@/lib/i18n/config';

i18n.use(LanguageDetector).use(initReactI18next).init(i18nConfig);

export const syncLanguage = (langKey: string) => {
  dayjs.locale(langKey);
  z.setErrorMap(makeZodI18nMap());
};

i18n.on('languageChanged', (langKey) => syncLanguage(langKey));
export default i18n;
