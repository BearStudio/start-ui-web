import React from 'react';

import { Box, BoxProps, Button, Flex, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { isEmail } from '@formiz/validations';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { FieldInput } from '@/components/FieldInput';
import { useToastError } from '@/components/Toast';
import { DemoLoginHint } from '@/features/demo-mode/DemoLoginHint';
import { trpc } from '@/lib/trpc/client';

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
  const trpcContext = trpc.useContext();

  const login = trpc.auth.login.useMutation({
    onSuccess: () => {
      queryCache.clear();
      // Optimistic Update
      trpcContext.auth.checkAuthenticated.setData(undefined, true);
      onSuccess();
    },
    onError: () => {
      toastError({
        title: t('auth:login.feedbacks.loginError.title'),
      });
    },
  });

  const form = useForm<{ email: string; password: string }>({
    onValidSubmit: (values) => login.mutate(values),
  });

  return (
    <Box {...rest}>
      <Formiz autoForm connect={form}>
        <Stack spacing={4}>
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
              href="/reset-password/request"
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
