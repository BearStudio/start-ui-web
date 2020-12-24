import React, { useState } from 'react';

import {
  Alert,
  AlertTitle,
  AlertDescription,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Stack,
  ScaleFade,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import {
  isEmail,
  isMaxLength,
  isMinLength,
  isPattern,
} from '@formiz/validations';
import { Link as RouterLink } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

import { useCreateAccount } from '@/app/account/service';
import { FieldInput, useToastError } from '@/components';

export const PageRegister = () => {
  const { t } = useTranslation();
  const form = useForm();
  const toastError = useToastError();
  const [accountEmail, setAccountEmail] = useState('');

  const { mutate: createUser, isLoading, isSuccess } = useCreateAccount({
    onMutate: () => {
      setAccountEmail(form.values?.email);
    },
    onError: (error: any) => {
      const { errorKey, title } = error?.response?.data || {};

      toastError({
        title: t('account:register.messages.registrationFailed'),
        description: title,
      });

      if (errorKey === 'userexists') {
        form.invalidateFields({ login: t('account:register.form.login.userexists') });
      }

      if (errorKey === 'emailexists') {
        form.invalidateFields({ email: t('account:register.form.email.emailexists') });
      }
    },
  });

  if (isSuccess) {
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
              {t('account:register.messages.accountCreatedSuccess.title')}
            </AlertTitle>
            <AlertDescription>
              <Trans
                t={t}
                i18nKey="account:register.messages.accountCreatedSuccess.description"
                tOptions={{ accountEmail }}
              >
                Please check your email <strong>{accountEmail}</strong> inbox to
                activate your account.
              </Trans>
            </AlertDescription>
          </Alert>
          <Center mt="8">
            <Button as={RouterLink} to="/login" variant="link">
              <Box as="strong" color="brand.500" ml="2">
                {t('account:register.actions.goToLogin')}
              </Box>
            </Button>
          </Center>
        </ScaleFade>
      </Center>
    );
  }

  return (
    <Box p="6" pb="4rem" w="20rem" maxW="full" m="auto">
      <Formiz
        id="register-form"
        autoForm
        onValidSubmit={createUser}
        connect={form}
      >
        <Heading my="4">{t('account:register.title')}</Heading>
        <Stack spacing="4">
          <FieldInput
            name="login"
            label={t('account:register.form.login.label') as string}
            required={t('account:register.form.login.required') as string}
            validations={[
              {
                rule: isMinLength(2),
                message: t('account:register.form.login.isMinLength', { count: 2 }),
              },
              {
                rule: isMaxLength(50),
                message: t('account:register.form.login.isMaxLength', { count: 50 }),
              },
              {
                rule: isPattern(
                  '^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$'
                ),
                message: t('account:register.form.login.isPattern'),
              },
            ]}
          />
          <FieldInput
            name="email"
            label={t('account:register.form.email.label') as string}
            required={t('account:register.form.email.required') as string}
            validations={[
              {
                rule: isMinLength(5),
                message: t('account:register.form.email.isMinLength', { count: 5 }),
              },
              {
                rule: isMaxLength(254),
                message: t('account:register.form.email.isMaxLength', { count: 254 }),
              },
              {
                rule: isEmail(),
                message: t('account:register.form.email.isEmail'),
              },
            ]}
          />
          <FieldInput
            name="password"
            type="password"
            label={t('account:register.form.password.label') as string}
            required={t('account:register.form.password.required') as string}
            validations={[
              {
                rule: isMinLength(4),
                message: t('account:register.form.password.isMinLength', { count: 4 }),
              },
              {
                rule: isMaxLength(50),
                message: t('account:register.form.password.isMaxLength', { count: 50 }),
              },
            ]}
          />
          <Flex>
            <Button
              isLoading={isLoading}
              isDisabled={form.isSubmitted && !form.isValid}
              type="submit"
              colorScheme="brand"
              ml="auto"
            >
              {t('account:register.actions.createAccount')}
            </Button>
          </Flex>
        </Stack>
        <Center mt="8">
          <Button as={RouterLink} to="/login" variant="link">
            {t('account:register.actions.alreadyHaveAnAccount')}{' '}
            <Box as="strong" color="brand.500" ml="2">
              {t('account:register.actions.login')}
            </Box>
          </Button>
        </Center>
      </Formiz>
    </Box>
  );
};
