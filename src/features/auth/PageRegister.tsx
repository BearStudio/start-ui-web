import React from 'react';

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Heading,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { SlideIn } from '@/components/SlideIn';
import { RegisterForm } from '@/features/auth/RegisterForm';

export default function PageRegister() {
  const { t } = useTranslation(['common', 'account']);

  return (
    <SlideIn>
      <Box p="2" pb="4rem" w="22rem" maxW="full" m="auto">
        <Card>
          <CardHeader pb={0}>
            <Heading size="md">{t('account:register.title')}</Heading>
          </CardHeader>
          <CardBody>
            <RegisterForm />
          </CardBody>
        </Card>
        <Center mt="8">
          <Button as={Link} href="/login" variant="link">
            {t('account:register.actions.alreadyHaveAnAccount')}{' '}
            <Box
              as="strong"
              ms="2"
              color="brand.500"
              _dark={{ color: 'brand.300' }}
            >
              {t('account:register.actions.login')}
            </Box>
          </Button>
        </Center>
      </Box>
    </SlideIn>
  );
}
