import React from 'react';

import {
  Box,
  BoxProps,
  Button,
  ButtonProps,
  Flex,
  Stack,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { isEmail } from '@formiz/validations';
import { useTranslation } from 'react-i18next';

import { FieldInput } from '@/components/FieldInput';
import { useToastError } from '@/components/Toast';
import { DevLoginHint } from '@/features/devtools/DevLoginHint';
import { trpc } from '@/lib/trpc/client';
import type { RouterInputs, RouterOutputs } from '@/lib/trpc/types';

type LoginFormProps = BoxProps & {
  onSuccess?: (
    data: RouterOutputs['auth']['login'],
    variables: RouterInputs['auth']['login']
  ) => void;
  buttonVariant?: ButtonProps['variant'];
};

export const LoginForm = ({
  onSuccess = () => undefined,
  buttonVariant = '@primary',
  ...rest
}: LoginFormProps) => {
  const { t } = useTranslation(['auth']);
  const toastError = useToastError();

  const login = trpc.auth.login.useMutation({
    onSuccess,
    onError: () => {
      toastError({
        title: t('auth:login.feedbacks.loginError.title'),
      });
    },
  });

  const form = useForm<{ email: string }>({
    onValidSubmit: (values) => {
      login.mutate(values)
    },
  });

  return (
    <Box {...rest}>
      <Formiz autoForm connect={form}>
        <Stack spacing={4}>
          <FieldInput
            name="email"
            size="lg"
            placeholder={t('auth:data.email.label')}
            required={t('auth:data.email.required')}
            validations={[
              {
                handler: isEmail(),
                message: t('auth:data.email.invalid'),
              },
            ]}
            formatValue={(v) => v?.toLowerCase().trim()}
          />

          <Flex>
            <Button
              isLoading={login.isLoading || login.isSuccess}
              isDisabled={form.isSubmitted && !form.isValid}
              type="submit"
              variant={buttonVariant}
              size="lg"
              flex={1}
            >
              {t('auth:login.actions.login')}
            </Button>
          </Flex>

          <DevLoginHint />
        </Stack>
      </Formiz>
    </Box>
  );
};
