import React from 'react';

import { Card, CardBody, CardHeader, Heading } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { LoginForm } from '@/features/auth/LoginForm';
import { ROUTES_AUTH } from '@/features/auth/routes';
import type { RouterInputs, RouterOutputs } from '@/lib/trpc/types';

export default function PageAdminLogin() {
  const { t } = useTranslation(['auth']);
  const router = useRouter();

  const handleOnSuccess = (
    data: RouterOutputs['auth']['login'],
    variables: RouterInputs['auth']['login']
  ) => {
    router.push(
      ROUTES_AUTH.admin.loginValidate({
        token: data.token,
        email: variables.email,
      })
    );
  };

  return (
    <Card boxShadow="card">
      <CardHeader pb={0}>
        <Heading size="md">{t('auth:login.adminTitle')}</Heading>
      </CardHeader>
      <CardBody>
        <LoginForm onSuccess={handleOnSuccess} />
      </CardBody>
    </Card>
  );
}
