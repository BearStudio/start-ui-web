import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { i18nConfig } from '@/platform/lib/i18n/config';

void i18n.use(LanguageDetector).use(initReactI18next).init(i18nConfig);

export default i18n;
