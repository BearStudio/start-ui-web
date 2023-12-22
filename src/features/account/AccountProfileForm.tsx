import React from 'react';

import { Button, ButtonGroup, Stack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ErrorPage } from '@/components/ErrorPage';
import { Form, FormField } from '@/components/Form';
import { LoaderFull } from '@/components/LoaderFull';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  FormFieldsAccountProfile,
  zFormFieldsAccountProfile,
} from '@/features/account/schemas';
import { useAvatarUpload } from '@/features/account/useAvatarUpload';
import { useUploadFile } from '@/hooks/useUploadFile';
import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE_KEY,
} from '@/lib/i18n/constants';
import { trpc } from '@/lib/trpc/client';

export const AccountProfileForm = () => {
  const { t } = useTranslation(['common', 'account']);
  const trpcUtils = trpc.useUtils();
  const account = trpc.account.get.useQuery(undefined, {
    staleTime: Infinity,
  });

  const accountAvatar = useFetchAvatar(account.data?.image || '', {
    enabled: !!account?.data?.image,
  });

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const uploadFile = useAvatarUpload();

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

  const form = useForm<FormFieldsAccountProfile>({
    mode: 'onBlur',
    resolver: zodResolver(zFormFieldsAccountProfile()),
    values: {
      name: account.data?.name ?? '',
      language: account.data?.language ?? DEFAULT_LANGUAGE_KEY,
    },
  });

  const onSubmit: SubmitHandler<FormFieldsAccountProfile> = (values) => {
    updateAccount.mutate(values);
  };

  return (
    <>
      {account.isLoading && <LoaderFull />}
      {account.isError && <ErrorPage />}
      {account.isSuccess && (
        <Stack spacing={4}>
          <Form {...form} onSubmit={onSubmit}>
            <Stack spacing={4}>
              <FormField
                control={form.control}
                name="name"
                type="text"
                label={t('account:data.name.label')}
              />
              <FormField
                control={form.control}
                name="language"
                type="select"
                options={AVAILABLE_LANGUAGES.map(({ key }) => ({
                  label: t(`common:languages.${key}`),
                  value: key,
                }))}
                label={t('account:data.language.label')}
              />
              <ButtonGroup spacing={3}>
                <Button
                  type="submit"
                  variant="@primary"
                  isLoading={updateAccount.isLoading}
                >
                  {t('account:profile.actions.update')}
                </Button>
                {form.formState.isDirty && (
                  <Button onClick={() => form.reset()}>
                    {t('common:actions.cancel')}
                  </Button>
                )}
              </ButtonGroup>
            </Stack>
          </Form>
        </Stack>
      )}
    </>
  );
};
