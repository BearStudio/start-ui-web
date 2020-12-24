import React from 'react';

import { Box, Button, Flex, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useLogin } from '@/app/auth/service';
import { FieldInput, useToastError } from '@/components';

export const LoginForm = ({ onSuccess = () => { }, ...rest }) => {
  const { t } = useTranslation();

  const form = useForm({ subscribe: 'form' });
  const toastError = useToastError();

  const { mutate: login, isLoading } = useLogin({
    onSuccess,
    onError: (error: any) => {
      toastError({
        title: t('auth:messages.loginFailed'),
        description: error?.response?.data?.title,
      });
    },
  });

  return (
    <Box {...rest}>
      <Formiz id="login-form" autoForm onValidSubmit={login} connect={form}>
        <Stack spacing="4">
          <FieldInput
            name="username"
            label={t('auth:form.username.label')}
            required={t('auth:form.username.required') as string}
          />
          <FieldInput
            name="password"
            type="password"
            label={t('auth:form.password.label')}
            required={t('auth:form.password.required') as string}
          />
          <Flex>
            <Button
              as={RouterLink}
              to="/account/reset"
              size="sm"
              variant="link"
            >
              {t('auth:forgotPassword')}
            </Button>
            <Button
              isLoading={isLoading}
              isDisabled={form.isSubmitted && !form.isValid}
              type="submit"
              colorScheme="brand"
              ml="auto"
            >
              {t('auth:login')}
            </Button>
          </Flex>
        </Stack>
      </Formiz>
    </Box>
  );
};
