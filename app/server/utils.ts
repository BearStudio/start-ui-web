import {
  getCookie,
  getHeaders as vinxiGetHeaders,
  setCookie,
} from '@tanstack/react-start/server';
import { entries } from 'remeda';

export const getHeaders = () => {
  const headers = new Headers();
  entries(vinxiGetHeaders()).forEach(([key, value]) => {
    if (value) {
      headers.append(key, value);
    }
  });
  return headers;
};

import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE_KEY,
} from '@/lib/i18n/constants';

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
    getHeaders()
      .get('accept-language')
      ?.split(',')?.[0] // Get the first language ar,en-US -> ar
      ?.split('-')?.[0]; // Get the first part en-US -> en

  const language = AVAILABLE_LANGUAGES.some((l) => l.key === value)
    ? value!
    : DEFAULT_LANGUAGE_KEY;

  setCookie('i18next', language);

  return language;
};
