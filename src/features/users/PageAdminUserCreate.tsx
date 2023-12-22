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
import { UserForm, UserFormFields } from '@/features/users/UserForm';
import { trpc } from '@/lib/trpc/client';
import { isErrorDatabaseConflict } from '@/lib/trpc/errors';

export default function PageAdminUserCreate() {
  const { t } = useTranslation(['common', 'users']);
  const router = useRouter();
  const trpcUtils = trpc.useUtils();

  const toastError = useToastError();
  const toastSuccess = useToastSuccess();

  const createUser = trpc.users.create.useMutation({
    onSuccess: async () => {
      await trpcUtils.users.getAll.invalidate();
      toastSuccess({
        title: t('users:create.feedbacks.updateSuccess.title'),
      });
      router.back();
    },
    onError: (error) => {
      if (isErrorDatabaseConflict(error, 'email')) {
        form.setErrors({ email: t('users:data.email.alreadyUsed') });

        return;
      }
      toastError({
        title: t('users:create.feedbacks.updateError.title'),
      });
    },
  });

  const form = useForm<UserFormFields>({
    onValidSubmit: (values) => {
      createUser.mutate(values);
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
                isLoading={createUser.isLoading || createUser.isSuccess}
                isDisabled={!form.isValid && form.isSubmitted}
              >
                {t('users:create.action.save')}
              </Button>
            </>
          }
        >
          <Heading size="sm">{t('users:create.title')}</Heading>
        </AdminLayoutPageTopBar>
        <AdminLayoutPageContent>
          <UserForm />
        </AdminLayoutPageContent>
      </AdminLayoutPage>
    </Formiz>
  );
}
