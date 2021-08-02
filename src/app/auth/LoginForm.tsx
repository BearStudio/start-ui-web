import React from 'react';

import {
  Alert,
  AlertDescription,
  Box,
  Button,
  Flex,
  Stack,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

import { useLogin } from '@/app/auth/auth.service';
import { FieldInput, useToastError } from '@/components';

const MockedApiHint = () => {
  const { t } = useTranslation();
  const form = useForm({ subscribe: 'form' });
  const mockedUsername = 'admin';
  const mockedPassword = 'admin';

  if (process.env.NEXT_PUBLIC_API_BASE_URL) return null;

  return (
    <Alert mt="4" borderRadius="md" textAlign="center" colorScheme="brand">
      <AlertDescription>
        <Trans
          t={t}
          i18nKey="auth:mockedApi.loginHint"
          values={{ credentials: `${mockedUsername}/${mockedPassword}` }}
          components={{
            button: (
              <Button
                variant="link"
                color="inherit"
                onClick={() =>
                  form.setFieldsValues({
                    username: mockedUsername,
                    password: mockedPassword,
                  })
                }
              />
            ),
          }}
        />
      </AlertDescription>
    </Alert>
  );
};

export const LoginForm = ({ onSuccess = () => undefined, ...rest }) => {
  const { t } = useTranslation();
  const form = useForm({ subscribe: 'form' });
  const toastError = useToastError();

  const { mutate: login, isLoading } = useLogin({
    onSuccess,
    onError: (error: any) => {
      toastError({
        title: t('auth:login.feedbacks.loginError.title'),
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
            label={t('auth:data.username.label')}
            required={t('auth:data.username.required') as string}
          />
          <FieldInput
            name="password"
            type="password"
            label={t('auth:data.password.label')}
            required={t('auth:data.password.required') as string}
          />
          <Flex>
            <Button
              as={RouterLink}
              to="/account/reset"
              size="sm"
              variant="link"
              whiteSpace="initial"
            >
              {t('auth:login.actions.forgotPassword')}
            </Button>
            <Button
              isLoading={isLoading}
              isDisabled={form.isSubmitted && !form.isValid}
              type="submit"
              variant="@primary"
              ms="auto"
            >
              {t('auth:login.actions.login')}
            </Button>
          </Flex>

          <MockedApiHint />
        </Stack>
      </Formiz>
    </Box>
  );
};
