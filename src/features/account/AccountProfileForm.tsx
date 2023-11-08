import React from 'react';

import { Button, ButtonGroup, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useTranslation } from 'react-i18next';

import { ErrorPage } from '@/components/ErrorPage';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { LoaderFull } from '@/components/LoaderFull';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE_KEY,
} from '@/lib/i18n/constants';
import { trpc } from '@/lib/trpc/client';

export const AccountProfileForm = () => {
  const { t } = useTranslation(['common', 'account']);
  const trpcUtils = trpc.useUtils();
  const account = trpc.account.get.useQuery(undefined, {
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const updateAccount = trpc.account.update.useMutation({
    onSuccess: async () => {
      await trpcUtils.account.invalidate();
      toastSuccess({
        title: t('account:profile.feedbacks.updateSuccess.title'),
      });
    },
    onError: () => {
      toastError({
        title: t('account:profile.feedbacks.updateError.title'),
      });
    },
  });

  const form = useForm<{
    name: string;
    language: string;
  }>({
    initialValues: {
      name: account.data?.name ?? undefined,

      language: account.data?.language ?? undefined,
    },
    onValidSubmit: (values) => {
      updateAccount.mutate(values);
    },
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
                  name="name"
                  label={t('account:data.name.label')}
                  required={t('account:data.name.required')}
                />
                <FieldSelect
                  name="language"
                  label={t('account:data.language.label')}
                  options={AVAILABLE_LANGUAGES.map(({ key }) => ({
                    label: t(`common:languages.${key}`),
                    value: key,
                  }))}
                  defaultValue={DEFAULT_LANGUAGE_KEY}
                />
                <ButtonGroup spacing={3}>
                  <Button
                    type="submit"
                    variant="@primary"
                    isLoading={updateAccount.isLoading}
                    isDisabled={!form.isValid && form.isSubmitted}
                  >
                    {t('account:profile.actions.update')}
                  </Button>
                  {!form.isPristine && (
                    <Button onClick={() => form.reset()}>
                      {t('common:actions.cancel')}
                    </Button>
                  )}
                </ButtonGroup>
              </Stack>
            </form>
          </Formiz>
        </Stack>
      )}
    </>
  );
};
