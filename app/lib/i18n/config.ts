import { InitOptions } from 'i18next';
import { keys } from 'remeda';

import { DEFAULT_LANGUAGE_KEY, DEFAULT_NAMESPACE } from '@/lib/i18n/constants';

import locales from '@/locales';

export const i18nConfig: InitOptions = {
  defaultNS: DEFAULT_NAMESPACE,
  ns: keys(locales[DEFAULT_LANGUAGE_KEY]),
  resources: locales,
  fallbackLng: DEFAULT_LANGUAGE_KEY,
  supportedLngs: keys(locales),
  detection: {
    caches: ['cookie'],
    cookieMinutes: 43200, // 30 days
    cookieOptions: { path: '/', sameSite: 'lax' },
  },

  // Fix issue with i18next types
  // https://www.i18next.com/overview/typescript#argument-of-type-defaulttfuncreturn-is-not-assignable-to-parameter-of-type-xyz
  returnNull: false,

  interpolation: {
    escapeValue: false, // react already safes from xss
  },
};
