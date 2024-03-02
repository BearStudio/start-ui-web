import React from 'react';

import { Button, ButtonGroup, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useTranslation } from 'react-i18next';

import { ErrorPage } from '@/components/ErrorPage';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { FieldUpload, FieldUploadValue } from '@/components/FieldUpload';
import { LoaderFull } from '@/components/LoaderFull';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { useFetchAvatar } from '@/features/account/service';
import { useAvatarUpload } from '@/features/account/useAvatarUpload';
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

  const form = useForm<{
    name: string;
    language: string;
    image: FieldUploadValue;
  }>({
    initialValues: {
      name: account.data?.name ?? undefined,
      language: account.data?.language ?? undefined,
      image: accountAvatar.data ?? undefined,
    },
    ready:
      account.isSuccess &&
      ((!!account?.data?.image && accountAvatar.isSuccess) ||
        !account?.data?.image),
    onValidSubmit: async ({ image, ...values }) => {
      try {
        const { fileUrl } = await uploadFile.mutateAsync(image.file);
        updateAccount.mutate({ ...values, image: fileUrl });
      } catch {
        form.setErrors({
          image: t('account:profile.feedbacks.uploadError.title'),
        });
      }
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
                <FieldUpload
                  name="image"
                  label={t('account:data.avatar.label')}
                  inputText={t('account:data.avatar.inputText')}
                  required={t('account:data.avatar.required')}
                  isLoading={!!account?.data?.image && accountAvatar.isFetching}
                />
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
                    isLoading={updateAccount.isLoading || uploadFile.isLoading}
                    isDisabled={
                      (!form.isValid && form.isSubmitted) || !form.isReady
                    }
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
