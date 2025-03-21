import locales from '@/locales';

export type Language = {
  key: keyof typeof locales;
  dir?: 'ltr' | 'rtl';
  fontScale?: number;
};

export const DEFAULT_NAMESPACE = 'common';

export const DEFAULT_LANGUAGE_KEY: Language['key'] = 'en';

export type LanguageKey = (typeof AVAILABLE_LANGUAGES)[number]['key'];
export const AVAILABLE_LANGUAGES = [
  {
    key: 'en',
  } as const,
  {
    key: 'fr',
  } as const,
  {
    key: 'ar',
    dir: 'rtl',
    fontScale: 1.2,
  } as const,
  {
    key: 'sw',
  } as const,
] satisfies Language[];
