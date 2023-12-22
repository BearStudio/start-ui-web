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
    if (account.isSuccess) {
      i18n.changeLanguage(account.data.language);
    }
  }, [account.isSuccess, account.data?.language, i18n]);
};
