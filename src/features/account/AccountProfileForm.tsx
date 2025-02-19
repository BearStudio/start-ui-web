import React from 'react';

import { Button, ButtonGroup, Stack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ErrorPage } from '@/components/ErrorPage';
import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/Form';
import { LoaderFull } from '@/components/LoaderFull';
import { toastCustom } from '@/components/Toast';
import {
  FormFieldsAccountProfile,
  zFormFieldsAccountProfile,
} from '@/features/account/schemas';
import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE_KEY,
} from '@/lib/i18n/constants';
import { useUploadFileMutation } from '@/lib/s3/client';
import { trpc } from '@/lib/trpc/client';

export const AccountProfileForm = () => {
  const { t } = useTranslation(['common', 'account']);
  const trpcUtils = trpc.useUtils();
  const account = trpc.account.get.useQuery(undefined, {
    staleTime: Infinity,
  });

  const uploadAvatar = useUploadFileMutation('avatar');

  const updateAccount = trpc.account.update.useMutation({
    onSuccess: async () => {
      await trpcUtils.account.invalidate();
      toastCustom({
        status: 'success',
        title: t('account:profile.feedbacks.updateSuccess.title'),
      });
    },
    onError: () => {
      toastCustom({
        status: 'error',
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
      image: account.data?.imageMetadata ?? null,
    },
  });

  const onSubmit: SubmitHandler<FormFieldsAccountProfile> = async ({
    image,
    ...values
  }) => {
    try {
      updateAccount.mutate({
        ...values,
        image: image?.file
          ? await uploadAvatar.mutateAsync(image.file)
          : account.data?.image,
      });
    } catch {
      form.setError('image', {
        message: t('account:profile.feedbacks.uploadError.title'),
      });
    }
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
                <FormFieldLabel>
                  {t('account:data.avatar.label')}
                </FormFieldLabel>
                <FormFieldController
                  name="image"
                  type="upload"
                  control={form.control}
                  inputText={t('account:data.avatar.inputText')}
                />
              </FormField>

              <FormField>
                <FormFieldLabel>{t('account:data.name.label')}</FormFieldLabel>
                <FormFieldController
                  control={form.control}
                  name="name"
                  type="text"
                />
              </FormField>
              <FormField>
                <FormFieldLabel>
                  {t('account:data.language.label')}
                </FormFieldLabel>
                <FormFieldController
                  control={form.control}
                  name="language"
                  type="select"
                  options={AVAILABLE_LANGUAGES.map(({ key }) => ({
                    label: t(`common:languages.${key}`),
                    value: key,
                  }))}
                />
              </FormField>

              <ButtonGroup spacing={3}>
                <Button
                  type="submit"
                  variant="@primary"
                  isLoading={updateAccount.isLoading || uploadAvatar.isLoading}
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
