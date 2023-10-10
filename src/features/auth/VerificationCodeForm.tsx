import { Button, HStack, Heading, Stack, Text, chakra } from '@chakra-ui/react';
import { FormContext, useFormContext } from '@formiz/core';
import { TRPCClientErrorLike } from '@trpc/client';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { FieldPinInput } from '@/components/FieldPinInput';
import {
  VALIDATION_TOKEN_EXPIRATION_IN_MINUTES,
  getRetryDelayInSeconds,
} from '@/features/auth/utils';
import { DevCodeHint } from '@/features/dev/DevCodeHint';
import { useSearchParamsUpdater } from '@/hooks/useSearchParamsUpdater';
import { AppRouter } from '@/server/router';

export const useOnVerificationCodeError = ({ form }: { form: FormContext }) => {
  const searchParams = useSearchParams();
  const searchParamsUpdater = useSearchParamsUpdater();

  return async (error: TRPCClientErrorLike<AppRouter>) => {
    if (error.data?.code === 'UNAUTHORIZED') {
      const retries = parseInt(searchParams.get('retries') ?? '0', 10);
      const seconds = getRetryDelayInSeconds(retries);

      searchParamsUpdater(
        {
          retries: (retries + 1).toString(),
        },
        { replace: true }
      );

      await new Promise((r) => {
        setTimeout(r, seconds * 1_000);
      });

      form.setErrors({
        code: `Code is invalid`, // TODO translations
      });

      return;
    }

    if (error.data?.code === 'BAD_REQUEST') {
      form.setErrors({ code: 'Code should be 6 digits' }); // TODO translations
      return;
    }

    form.setErrors({ code: 'Unkown error' }); // TODO translations
  };
};

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
        <Heading size="md">{t('auth:login.code.title')}</Heading>
        <Text fontSize="sm">
          {/* TODO translations */}
          We&apos;ve sent a 6-character code to{' '}
          <chakra.strong>{email}</chakra.strong>. The code expires shortly (
          {VALIDATION_TOKEN_EXPIRATION_IN_MINUTES} minutes), so please enter it
          soon.
        </Text>
      </Stack>
      <FieldPinInput
        name="code"
        label="Verification code" // TODO translations
        helper="Can't find the code? Check your spams." // TODO translations
        autoFocus
        isDisabled={isLoading}
        onComplete={() => {
          // Only auto submit on first try
          if (!form.isSubmitted) {
            form.submit();
          }
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
          Confirm {/* TODO translations */}
        </Button>
      </HStack>

      <DevCodeHint />
    </Stack>
  );
};
