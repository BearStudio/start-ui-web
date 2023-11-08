import React from 'react';

import { Button, Flex, Stack } from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import { isEmail } from '@formiz/validations';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { ErrorPage } from '@/components/ErrorPage';
import { FieldInput } from '@/components/FieldInput';
import { LoaderFull } from '@/components/LoaderFull';
import { useToastError } from '@/components/Toast';
import {
  EmailVerificationCodeModale,
  SEARCH_PARAM_VERIFY_EMAIL,
} from '@/features/account/EmailVerificationCodeModal';
import { useSearchParamsUpdater } from '@/hooks/useSearchParamsUpdater';
import { trpc } from '@/lib/trpc/client';

export const AccountEmailForm = () => {
  const { t } = useTranslation(['common', 'account']);
  const searchParams = useSearchParams();
  const verifyEmail = searchParams.get(SEARCH_PARAM_VERIFY_EMAIL);
  const searchParamsUpdater = useSearchParamsUpdater();
  const account = trpc.account.get.useQuery(undefined, {
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const toastError = useToastError();

  const updateEmail = trpc.account.updateEmail.useMutation({
    onSuccess: async ({ token }, { email }) => {
      searchParamsUpdater(
        {
          [SEARCH_PARAM_VERIFY_EMAIL]: email,
          token,
        },
        {
          replace: true,
        }
      );
    },
    onError: () => {
      toastError({
        title: t('account:email.feedbacks.updateError.title'),
      });
    },
  });

  const form = useForm<{
    email: string;
  }>({
    initialValues: {
      email: account.data?.email ?? undefined,
    },
    onValidSubmit: (values) => {
      updateEmail.mutate(values);
    },
  });

  const values = useFormFields({
    connect: form,
    selector: 'value',
  });

  return (
    <>
      {account.isLoading && <LoaderFull />}
      {account.isError && <ErrorPage />}
      {account.isSuccess && (
        <Stack spacing={4}>
          <Formiz connect={form}>
            <form noValidate onSubmit={form.submit}>
              <Stack spacing={4}>
                <FieldInput
                  name="email"
                  label={t('account:data.email.label')}
                  required={t('account:data.email.required')}
                  validations={[
                    {
                      handler: isEmail(),
                      message: t('account:data.email.invalid'),
                    },
                  ]}
                />
                <Flex alignItems="center" gap={4}>
                  <Button
                    type="submit"
                    variant="@primary"
                    isDisabled={
                      (form.isSubmitted && !form.isValid) ||
                      account.data.email === values.email
                    }
                    isLoading={updateEmail.isLoading}
                  >
                    {t('account:email.actions.update')}
                  </Button>
                  {account.data.email === values.email && (
                    <Flex fontSize="sm" color="text-dimmed">
                      {t('account:data.email.current')}
                    </Flex>
                  )}
                  {account.data.email !== values.email && (
                    <Button onClick={() => form.reset()}>
                      {t('common:actions.cancel')}
                    </Button>
                  )}
                </Flex>
              </Stack>
            </form>
          </Formiz>
        </Stack>
      )}
      {!!verifyEmail && <EmailVerificationCodeModale />}
    </>
  );
};
