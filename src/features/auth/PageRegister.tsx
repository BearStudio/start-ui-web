import React, { useEffect, useState } from 'react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Flex,
  Heading,
  ScaleFade,
  Stack,
} from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import { isEmail } from '@formiz/validations';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';

import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { SlideIn } from '@/components/SlideIn';
import { useToastError } from '@/components/Toast';
import { DemoRegisterHint } from '@/features/demo-mode/DemoRegisterHint';
import { AVAILABLE_LANGUAGES } from '@/lib/i18n/constants';
import { Language } from '@/lib/i18n/constants';
import { trpc } from '@/lib/trpc/client';

export default function PageRegister() {
  const { t, i18n } = useTranslation(['common', 'auth']);

  const toastError = useToastError();
  const [accountEmail, setAccountEmail] = useState('');

  const register = trpc.auth.register.useMutation({
    onMutate: ({ email }) => {
      setAccountEmail(email);
    },
    onError: (error) => {
      if (error.data?.code === 'CONFLICT') {
        form.setErrors({ email: t('auth:data.email.alreadyUsed') });
        return;
      }
      toastError({
        title: t('auth:register.feedbacks.registrationError.title'),
      });
    },
  });

  const form = useForm<{
    language: string;
    name: string;
    email: string;
    password: string;
  }>({
    onValidSubmit: (values) => register.mutate(values),
  });

  const values = useFormFields({
    connect: form,
    fields: ['language'] as const,
    selector: (field) => field.value,
  });

  // Change language based on form
  useEffect(() => {
    i18n.changeLanguage(values?.language);
  }, [i18n, values?.language]);

  if (register.isSuccess) {
    return (
      <Center p="4" m="auto">
        <ScaleFade initialScale={0.9} in>
          <Alert
            status="success"
            variant="solid"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            borderRadius="lg"
            px="8"
            py="4"
          >
            <Box fontSize="3rem">🎉</Box>
            <AlertTitle mt={4} mb={1} fontSize="lg">
              {t('auth:register.feedbacks.registrationSuccess.title')}
            </AlertTitle>
            <AlertDescription>
              <Trans
                t={t}
                i18nKey="auth:register.feedbacks.registrationSuccess.description"
                values={{ email: accountEmail }}
              />
            </AlertDescription>
          </Alert>
          <Center mt="8">
            <Button
              as={Link}
              href="/login"
              variant="link"
              color="brand.500"
              _dark={{ color: 'brand.300' }}
            >
              {t('auth:register.actions.goToLogin')}
            </Button>
          </Center>
        </ScaleFade>
      </Center>
    );
  }

  return (
    <SlideIn>
      <Box p="2" pb="4rem" w="22rem" maxW="full" m="auto">
        <Card>
          <CardHeader pb={0}>
            <Heading size="md">{t('auth:register.title')}</Heading>
          </CardHeader>
          <CardBody>
            <Formiz connect={form} autoForm>
              <Stack spacing="4">
                <FieldSelect
                  name="language"
                  label={t('auth:data.language.label')}
                  options={AVAILABLE_LANGUAGES.map(({ key }) => ({
                    label: t(`common:languages.${key}`),
                    value: key,
                  }))}
                  defaultValue={i18n.language as Language['key']}
                />
                <FieldInput
                  name="name"
                  label={t('auth:data.name.label')}
                  required={t('auth:data.name.required')}
                />
                <FieldInput
                  name="email"
                  label={t('auth:data.email.label')}
                  required={t('auth:data.email.required')}
                  validations={[
                    {
                      handler: isEmail(),
                      message: t('auth:data.email.invalid'),
                    },
                  ]}
                />
                <FieldInput
                  name="password"
                  type="password"
                  label={t('auth:data.password.label')}
                  required={t('auth:data.password.required')}
                />
                <Flex>
                  <Button
                    isLoading={register.isLoading}
                    isDisabled={form.isSubmitted && !form.isValid}
                    type="submit"
                    variant="@primary"
                    ms="auto"
                  >
                    {t('auth:register.actions.create')}
                  </Button>
                </Flex>
                <DemoRegisterHint />
              </Stack>
            </Formiz>
          </CardBody>
        </Card>
        <Center mt="8">
          <Button as={Link} href="/login" variant="link">
            {t('auth:register.actions.alreadyHaveAnAccount')}{' '}
            <Box
              as="strong"
              ms="2"
              color="brand.500"
              _dark={{ color: 'brand.300' }}
            >
              {t('auth:register.actions.login')}
            </Box>
          </Button>
        </Center>
      </Box>
    </SlideIn>
  );
}
