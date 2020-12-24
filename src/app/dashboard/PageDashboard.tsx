import React from 'react';

import { Heading } from '@chakra-ui/react';

import { Page, PageHeader, PageBody, PageFooter } from '@/components';
import { useTranslation } from 'react-i18next';

export const PageDashboard = () => {
  const { t } = useTranslation()
  return (
    <Page>
      <PageHeader>
        <Heading size="md">{t('dashboard:title')}</Heading>
      </PageHeader>
      <PageBody>Body</PageBody>
      <PageFooter>Footer</PageFooter>
    </Page>
  );
};
