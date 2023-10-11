import React from 'react';

import { Box, Card, CardBody, CardHeader, Heading } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { Logo } from '@/components/Logo';
import { SlideIn } from '@/components/SlideIn';
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
    <SlideIn>
      <Box px="2" py="4rem" w="22rem" maxW="full" m="auto">
        <Logo h="3rem" mb="8" mx="auto" />
        <Card>
          <CardHeader pb={0}>
            <Heading size="md">{t('auth:login.title')}</Heading>
          </CardHeader>
          <CardBody>
            <LoginForm onSuccess={handleOnSuccess} />
          </CardBody>
        </Card>
      </Box>
    </SlideIn>
  );
}
