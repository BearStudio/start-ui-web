import React from 'react';

import { Button, Flex, Stack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { parseAsString, useQueryStates } from 'nuqs';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ErrorPage } from '@/components/ErrorPage';
import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/Form';
import { LoaderFull } from '@/components/LoaderFull';
import { useToastError } from '@/components/Toast';
import { EmailVerificationCodeModale } from '@/features/account/EmailVerificationCodeModal';
import {
  FormFieldsAccountEmail,
  zFormFieldsAccountEmail,
} from '@/features/account/schemas';
import { trpc } from '@/lib/trpc/client';

export const AccountEmailForm = () => {
  const { t } = useTranslation(['common', 'account']);
  const [searchParams, setSearchParams] = useQueryStates({
    verifyEmail: parseAsString,
    token: parseAsString,
  });

  const account = trpc.account.get.useQuery(undefined, {
    staleTime: Infinity,
  });

  const toastError = useToastError();

  const updateEmail = trpc.account.updateEmail.useMutation({
    onSuccess: async ({ token }, { email }) => {
      setSearchParams({
        verifyEmail: email,
        token,
      });
    },
    onError: () => {
      toastError({
        title: t('account:email.feedbacks.updateError.title'),
      });
    },
  });

  const form = useForm<FormFieldsAccountEmail>({
    mode: 'onBlur',
    resolver: zodResolver(zFormFieldsAccountEmail()),
    values: {
      email: account.data?.email ?? '',
    },
  });

  const email = useWatch({ name: 'email', control: form.control });

  const onSubmit: SubmitHandler<FormFieldsAccountEmail> = (values) => {
    updateEmail.mutate(values);
  };

  return (
    <>
      {account.isLoading && <LoaderFull />}
      {account.isError && <ErrorPage />}
      {account.isSuccess && (
        <Stack spacing={4}>
          <Form {...form} onSubmit={onSubmit}>
            <Stack spacing={4}>
              <FormField>
                <FormFieldLabel>{t('account:data.email.label')}</FormFieldLabel>
                <FormFieldController
                  name="email"
                  type="email"
                  control={form.control}
                />
              </FormField>
              <Flex alignItems="center" gap={4}>
                <Button
                  type="submit"
                  variant="@primary"
                  isDisabled={account.data.email === email}
                  isLoading={updateEmail.isLoading}
                >
                  {t('account:email.actions.update')}
                </Button>
                {account.data.email === email && (
                  <Flex fontSize="sm" color="text-dimmed">
                    {t('account:data.email.current')}
                  </Flex>
                )}
                {account.data.email !== email && (
                  <Button onClick={() => form.reset()}>
                    {t('common:actions.cancel')}
                  </Button>
                )}
              </Flex>
            </Stack>
          </Form>
        </Stack>
      )}
      {!!searchParams.verifyEmail && <EmailVerificationCodeModale />}
    </>
  );
};
