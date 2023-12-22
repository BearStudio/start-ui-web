import React from 'react';

import { Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { AccountEmailForm } from '@/features/account/AccountEmailForm';
import { AdminAccountNav } from '@/features/account/AdminAccountNav';
import {
  AdminLayoutPage,
  AdminLayoutPageContent,
} from '@/features/admin/AdminLayoutPage';

export default function PageAdminEmail() {
  const { t } = useTranslation(['common', 'account']);

  return (
    <AdminLayoutPage containerMaxWidth="container.md" nav={<AdminAccountNav />}>
      <AdminLayoutPageContent>
        <Heading size="md" mb="4">
          {t('account:email.title')}
        </Heading>
        <AccountEmailForm />
      </AdminLayoutPageContent>
    </AdminLayoutPage>
  );
}
