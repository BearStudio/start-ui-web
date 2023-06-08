import React from 'react';

import { Box, BoxProps, Button, Flex, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { FieldInput } from '@/components/FieldInput';
import { useToastError } from '@/components/Toast';
import { useLogin } from '@/features/auth/service';
import { DemoLoginHint } from '@/features/demo-mode/DemoLoginHint';

type LoginFormProps = BoxProps & {
  onSuccess?: () => void;
};

export const LoginForm = ({
  onSuccess = () => undefined,
  ...rest
}: LoginFormProps) => {
  const { t } = useTranslation(['auth']);
  const toastError = useToastError();
  const queryCache = useQueryClient();

  const login = useLogin({
    onSuccess: () => {
      queryCache.clear();
      onSuccess();
    },
    onError: (error) => {
      toastError({
        title: t('auth:login.feedbacks.loginError.title'),
        description: error?.response?.data?.title,
      });
    },
  });

  const form = useForm<{ username: string; password: string }>({
    onValidSubmit: (values) => login.mutate(values),
  });

  return (
    <Box {...rest}>
      <Formiz autoForm connect={form}>
        <Stack spacing={4}>
          <FieldInput
            name="username"
            label={t('auth:data.username.label')}
            required={t('auth:data.username.required')}
            formatValue={(v) => v?.toLowerCase().trim()}
          />
          <FieldInput
            name="password"
            type="password"
            label={t('auth:data.password.label')}
            required={t('auth:data.password.required')}
          />
          <Flex>
            <Button
              as={Link}
              to="/account/reset"
              size="sm"
              variant="link"
              whiteSpace="initial"
            >
              {t('auth:login.actions.forgotPassword')}
            </Button>
            <Button
              isLoading={login.isLoading}
              isDisabled={form.isSubmitted && !form.isValid}
              type="submit"
              variant="@primary"
              ms="auto"
            >
              {t('auth:login.actions.login')}
            </Button>
          </Flex>

          <DemoLoginHint />
        </Stack>
      </Formiz>
    </Box>
  );
};
