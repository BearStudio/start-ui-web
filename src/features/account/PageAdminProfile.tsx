import React from 'react';

import { Card, CardBody, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { Page, PageContent } from '@/components/Page';
import { AccountProfileForm } from '@/features/account/AccountProfileForm';
import { AdminAccountNav } from '@/features/account/AdminAccountNav';

export default function PageAdminProfile() {
  const { t } = useTranslation(['common', 'account']);

  return (
    <Page nav={<AdminAccountNav />}>
      <PageContent>
        <Heading size="md" mb="4">
          {t('account:profile.title')}
        </Heading>

        <Card>
          <CardBody>
            <AccountProfileForm />
          </CardBody>
        </Card>
      </PageContent>
    </Page>
  );
}
