import React from 'react';
import { useTranslation } from 'react-i18next';

import { Heading } from '@chakra-ui/react';

import { useAccount } from '@/app/account/service';
import { Page, PageBody, PageHeader } from '@/components';

export const PageAccount = () => {
  const { t } = useTranslation();
  const { account } = useAccount();
  return (
    <Page>
      <PageHeader>
        <Heading size="md">{t('account:title')}</Heading>
      </PageHeader>
      <PageBody>
        <pre>{JSON.stringify(account, null, 2)}</pre>
      </PageBody>
    </Page>
  );
};
