import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { AVAILABLE_LANGUAGES } from '@/lib/i18n/constants';

export const useLocale = () => {
  const { i18n } = useTranslation();
  const [locale, setLocale] = useState<{
    lang: string | undefined;
    dir: 'ltr' | 'rtl';
  }>();

  useEffect(() => {
    setLocale({
      lang: i18n.language,
      dir:
        AVAILABLE_LANGUAGES.find(({ key }) => key === i18n.language)?.dir ??
        'ltr',
    });
  }, [i18n.language]);

  return locale;
};
