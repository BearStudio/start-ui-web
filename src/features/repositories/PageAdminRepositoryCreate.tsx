import React from 'react';

import { Button, ButtonGroup, Heading } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  AdminLayoutPage,
  AdminLayoutPageBottomBar,
  AdminLayoutPageContent,
  AdminLayoutPageTopBar,
} from '@/features/admin/AdminLayoutPage';
import {
  RepositoryForm,
  RepositoryFormFields,
} from '@/features/repositories/RepositoryForm';
import { trpc } from '@/lib/trpc/client';
import { isErrorDatabaseConflict } from '@/lib/trpc/errors';

export default function PageAdminRepositoryCreate() {
  const { t } = useTranslation(['common', 'repositories']);
  const trpcUtils = trpc.useUtils();
  const router = useRouter();

  const toastError = useToastError();
  const toastSuccess = useToastSuccess();

  const createRepository = trpc.repositories.create.useMutation({
    onSuccess: async () => {
      await trpcUtils.repositories.getAll.invalidate();
      toastSuccess({
        title: t('repositories:create.feedbacks.updateSuccess.title'),
      });
      router.back();
    },
    onError: (error) => {
      if (isErrorDatabaseConflict(error, 'name')) {
        form.setErrors({ name: t('repositories:data.name.alreadyUsed') });
        return;
      }
      toastError({
        title: t('repositories:create.feedbacks.updateError.title'),
      });
    },
  });

  const form = useForm<RepositoryFormFields>({
    onValidSubmit: (values) => {
      createRepository.mutate(values);
    },
  });

  return (
    <AdminLayoutPage containerMaxWidth="container.md" showNavBar={false}>
      <Formiz connect={form}>
        <form noValidate onSubmit={form.submit}>
          <AdminLayoutPageTopBar showBack onBack={() => router.back()}>
            <Heading size="md">{t('repositories:create.title')}</Heading>
          </AdminLayoutPageTopBar>
          <AdminLayoutPageContent>
            <RepositoryForm />
          </AdminLayoutPageContent>
          <AdminLayoutPageBottomBar>
            <ButtonGroup justifyContent="space-between">
              <Button onClick={() => router.back()}>
                {t('common:actions.cancel')}
              </Button>
              <Button
                type="submit"
                variant="@primary"
                isLoading={
                  createRepository.isLoading || createRepository.isSuccess
                }
              >
                {t('repositories:create.action.save')}
              </Button>
            </ButtonGroup>
          </AdminLayoutPageBottomBar>
        </form>
      </Formiz>
    </AdminLayoutPage>
  );
}
