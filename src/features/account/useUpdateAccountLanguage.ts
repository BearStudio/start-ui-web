import { useEffect } from 'react';

import { useTranslation } from 'react-i18next';

import { trpc } from '@/lib/trpc/client';

export const useUpdateAccountLanguage = () => {
  const { i18n } = useTranslation();
  const account = trpc.account.get.useQuery();

  useEffect(() => {
    i18n.changeLanguage(account.data?.language);
  }, [account.data?.language, i18n]);
};
