import dayjs from 'dayjs';
import { InitOptions } from 'i18next';
import { keys } from 'remeda';

import { DEFAULT_LANGUAGE_KEY, DEFAULT_NAMESPACE } from '@/lib/i18n/constants';

import locales from '@/locales';

dayjs.locale(DEFAULT_LANGUAGE_KEY);

export const i18nConfig: InitOptions = {
  defaultNS: DEFAULT_NAMESPACE,
  ns: keys(locales[DEFAULT_LANGUAGE_KEY]),
  resources: locales,
  fallbackLng: DEFAULT_LANGUAGE_KEY,
  supportedLngs: keys(locales),
  detection: {
    caches: ['localStorage', 'cookie'],
  },

  // Fix issue with i18next types
  // https://www.i18next.com/overview/typescript#argument-of-type-defaulttfuncreturn-is-not-assignable-to-parameter-of-type-xyz
  returnNull: false,

  interpolation: {
    escapeValue: false, // react already safes from xss
  },
};
