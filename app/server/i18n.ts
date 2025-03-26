import { getCookie, setCookie } from 'vinxi/http';

import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE_KEY,
} from '@/lib/i18n/constants';

import { getHeaders } from '@/server/utils';

/**
 * Retrieves the user's language preference.
 *
 * @param {string} [input] - Optional input language key. If not provided, the function will attempt to retrieve the language from a cookie named 'i18next'.
 * @returns {string} - Returns the language key if it is available in the list of supported languages. Otherwise, returns the default language key.
 */
export const getUserLanguage = (input?: string) => {
  const value =
    input ??
    getCookie('i18next') ??
    getHeaders().get('accept-language')?.split('-')?.[0];

  const language = AVAILABLE_LANGUAGES.some((l) => l.key === value)
    ? value!
    : DEFAULT_LANGUAGE_KEY;

  setCookie('i18next', language);

  return language;
};
