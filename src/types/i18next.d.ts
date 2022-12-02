import 'i18next';

import { DEFAULT_NAMESPACE } from '@/constants/i18n';
import locales from '@/locales';

// Fix issue with i18next types
// https://www.i18next.com/overview/typescript#argument-of-type-defaulttfuncreturn-is-not-assignable-to-parameter-of-type-xyz

declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
    defaultNS: typeof DEFAULT_NAMESPACE;
    resources: typeof locales['en'];
  }
}
