import React from 'react';

import { Button, Heading } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useToastError, useToastSuccess } from '@/components/Toast';
import { AdminBackButton } from '@/features/admin/AdminBackButton';
import { AdminCancelButton } from '@/features/admin/AdminCancelButton';
import {
  AdminLayoutPage,
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
    <Formiz connect={form} autoForm>
      <AdminLayoutPage containerMaxWidth="container.md" showNavBar={false}>
        <AdminLayoutPageTopBar
          leftActions={<AdminBackButton withConfrim={!form.isPristine} />}
          rightActions={
            <>
              <AdminCancelButton withConfrim={!form.isPristine} />
              <Button
                type="submit"
                variant="@primary"
                isLoading={
                  createRepository.isLoading || createRepository.isSuccess
                }
                isDisabled={!form.isValid && form.isSubmitted}
              >
                {t('repositories:create.action.save')}
              </Button>
            </>
          }
        >
          <Heading size="sm">{t('repositories:create.title')}</Heading>
        </AdminLayoutPageTopBar>
        <AdminLayoutPageContent>
          <RepositoryForm />
        </AdminLayoutPageContent>
      </AdminLayoutPage>
    </Formiz>
  );
}
