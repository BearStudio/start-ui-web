import React from 'react';

import { Card, CardBody, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { Page, PageContent } from '@/components/Page';
import { AccountEmailForm } from '@/features/account/AccountEmailForm';
import { AdminAccountNav } from '@/features/account/AdminAccountNav';

export default function PageAdminEmail() {
  const { t } = useTranslation(['common', 'account']);

  return (
    <>
      <Page nav={<AdminAccountNav />}>
        <PageContent>
          <Heading size="md" mb="4">
            {t('account:email.title')}
          </Heading>
          <Card>
            <CardBody>
              <AccountEmailForm />
            </CardBody>
          </Card>
        </PageContent>
      </Page>
    </>
  );
}
