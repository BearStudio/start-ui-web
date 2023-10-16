import React from 'react';

import { Card, CardBody, CardHeader, Heading } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { ADMIN_PATH } from '@/features/admin/constants';
import { LoginForm } from '@/features/auth/LoginForm';
import { RouterInput, RouterOutput } from '@/server/router';

export default function PageAdminLogin() {
  const { t } = useTranslation(['auth']);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleOnSuccess = (
    data: RouterOutput['auth']['login'],
    variables: RouterInput['auth']['login']
  ) => {
    const urlSearchParams = new URLSearchParams(searchParams);
    urlSearchParams.set('email', variables.email);
    router.push(
      `${ADMIN_PATH}/login/${data.token}?${urlSearchParams.toString()}`
    );
  };

  return (
    <Card boxShadow="layout">
      <CardHeader pb={0}>
        <Heading size="md">{t('auth:login.adminTitle')}</Heading>
      </CardHeader>
      <CardBody>
        <LoginForm onSuccess={handleOnSuccess} />
      </CardBody>
    </Card>
  );
}
