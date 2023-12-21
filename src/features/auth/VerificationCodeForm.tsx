import { Button, HStack, Heading, Stack, Text } from '@chakra-ui/react';
import { FormContext, useFormContext } from '@formiz/core';
import { useQueryClient } from '@tanstack/react-query';
import { TRPCClientErrorLike } from '@trpc/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Trans, useTranslation } from 'react-i18next';

import { FieldPinInput } from '@/components/FieldPinInput';
import {
  VALIDATION_TOKEN_EXPIRATION_IN_MINUTES,
  getValidationRetryDelayInSeconds,
} from '@/features/auth/utils';
import { DevCodeHint } from '@/features/devtools/DevCodeHint';
import { useSearchParamsUpdater } from '@/hooks/useSearchParamsUpdater';
import { trpc } from '@/lib/trpc/client';
import { AppRouter } from '@/lib/trpc/types';

export type VerificationCodeFormProps = {
  email: string;
  isLoading?: boolean;
};

export const VerificationCodeForm = ({
  email,
  isLoading,
}: VerificationCodeFormProps) => {
  const { t } = useTranslation(['auth']);
  const form = useFormContext();
  return (
    <Stack spacing="4">
      <Stack>
        <Heading size="md">{t('auth:validate.title')}</Heading>
        <Text fontSize="sm">
          <Trans
            t={t}
            i18nKey="auth:validate.description"
            values={{
              email,
              expiration: VALIDATION_TOKEN_EXPIRATION_IN_MINUTES,
            }}
            components={{
              b: <strong />,
            }}
          />
        </Text>
      </Stack>
      <FieldPinInput
        name="code"
        label={t('auth:data.verificationCode.label')}
        helper={t('auth:data.verificationCode.helper')}
        autoFocus
        isDisabled={isLoading}
        required={t('auth:data.verificationCode.required')}
        pinInputProps={{
          onComplete: () => {
            // Only auto submit on first try
            if (!form.isSubmitted) {
              form.submit();
            }
          },
        }}
      />
      <HStack spacing={8}>
        <Button
          size="lg"
          isLoading={isLoading}
          isDisabled={form.isSubmitted && !form.isValid}
          type="submit"
          variant="@primary"
          flex={1}
        >
          {t('auth:validate.actions.confirm')}
        </Button>
      </HStack>

      <DevCodeHint />
    </Stack>
  );
};

export const useOnVerificationCodeSuccess = ({
  defaultRedirect = '/',
}: {
  defaultRedirect: string;
}) => {
  const router = useRouter();
  const trpcUtils = trpc.useUtils();
  const queryCache = useQueryClient();
  const searchParams = useSearchParams();
  return async () => {
    queryCache.clear();

    // Optimistic Update
    trpcUtils.auth.checkAuthenticated.setData(undefined, {
      isAuthenticated: true,
    });

    router.push(searchParams.get('redirect') || defaultRedirect || '/');
  };
};

export const useOnVerificationCodeError = ({ form }: { form: FormContext }) => {
  const { t } = useTranslation(['auth']);
  const searchParams = useSearchParams();
  const searchParamsUpdater = useSearchParamsUpdater();

  return async (error: TRPCClientErrorLike<AppRouter>) => {
    if (error.data?.code === 'UNAUTHORIZED') {
      const attempts = parseInt(searchParams.get('attempts') ?? '0', 10);
      const seconds = getValidationRetryDelayInSeconds(attempts);

      searchParamsUpdater(
        {
          attempts: (attempts + 1).toString(),
        },
        { replace: true }
      );

      await new Promise((r) => {
        setTimeout(r, seconds * 1_000);
      });

      form.setErrors({
        code: t('auth:data.verificationCode.unknown'),
      });

      return;
    }

    if (error.data?.code === 'BAD_REQUEST') {
      form.setErrors({ code: t('auth:data.verificationCode.invalid') });
      return;
    }

    form.setErrors({ code: t('auth:data.verificationCode.unknown') });
  };
};
