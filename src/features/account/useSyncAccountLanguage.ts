import { useEffect } from 'react';

import { useTranslation } from 'react-i18next';

import { trpc } from '@/lib/trpc/client';

export const useSyncAccountLanguage = () => {
  const checkAuthenticated = trpc.auth.checkAuthenticated.useQuery();
  const account = trpc.account.get.useQuery(undefined, {
    enabled: !!checkAuthenticated.data?.isAuthenticated,
  });

  const { i18n } = useTranslation();
  useEffect(() => {
    const updateLanguage = () => {
      if (account.data?.language) {
        i18n.changeLanguage(account.data.language);
      }
    };
    i18n.on('initialized', updateLanguage);

    updateLanguage();

    return () => {
      i18n.off('initialized', updateLanguage);
    };
  }, [account.isSuccess, account.data?.language, i18n]);
};
