import React from 'react';

import { Button, ButtonGroup, Stack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
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
import { uploadFile } from '@/lib/s3/client';
import { FILES_COLLECTIONS_CONFIG } from '@/lib/s3/config';
import { trpc } from '@/lib/trpc/client';

export const AccountProfileForm = () => {
  const { t } = useTranslation(['common', 'account']);
  const trpcUtils = trpc.useUtils();
  const account = trpc.account.get.useQuery(undefined, {
    staleTime: Infinity,
  });

  const updateAccount = useMutation({
    mutationFn: async ({ image, ...values }: FormFieldsAccountProfile) => {
      return await trpcUtils.client.account.update.mutate({
        ...values,
        image: image?.file
          ? await uploadFile({
              trpcClient: trpcUtils.client,
              collection: 'avatar',
              file: image.file,
              onError: () => {
                form.setError('image', {
                  message: t('account:profile.feedbacks.uploadError.title'),
                });
              },
            })
          : account.data?.image,
      });
    },
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

  return (
    <>
      {account.isLoading && <LoaderFull />}
      {account.isError && <ErrorPage />}
      {account.isSuccess && (
        <Stack spacing={4}>
          <Form
            {...form}
            onSubmit={(values) => {
              updateAccount.mutate(values);
            }}
          >
            <Stack spacing={4}>
              <FormField>
                <FormFieldLabel>
                  {t('account:data.avatar.label')}
                </FormFieldLabel>
                <FormFieldController
                  name="image"
                  type="upload"
                  control={form.control}
                  placeholder={t('account:data.avatar.placeholder')}
                  accept={FILES_COLLECTIONS_CONFIG['avatar'].allowedTypes.join(
                    ','
                  )}
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
