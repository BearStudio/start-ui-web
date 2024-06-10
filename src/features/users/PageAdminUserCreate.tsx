import React from 'react';

import { Button, Heading } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Form } from '@/components/Form';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { AdminBackButton } from '@/features/admin/AdminBackButton';
import { AdminCancelButton } from '@/features/admin/AdminCancelButton';
import {
  AdminLayoutPage,
  AdminLayoutPageContent,
  AdminLayoutPageTopBar,
} from '@/features/admin/AdminLayoutPage';
import { UserForm } from '@/features/users/UserForm';
import { FormFieldUser, zFormFieldsUser } from '@/features/users/schemas';
import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';
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
        form.setError('email', { message: t('users:data.email.alreadyUsed') });
        return;
      }
      toastError({
        title: t('users:create.feedbacks.updateError.title'),
      });
    },
  });

  const form = useForm<FormFieldUser>({
    resolver: zodResolver(zFormFieldsUser()),
    defaultValues: {
      name: '',
      email: '',
      language: DEFAULT_LANGUAGE_KEY,
      authorizations: ['APP'],
    },
  });

  return (
    <Form
      {...form}
      onSubmit={(values) => {
        createUser.mutate(values);
      }}
    >
      <AdminLayoutPage containerMaxWidth="container.md" showNavBar={false}>
        <AdminLayoutPageTopBar
          leftActions={<AdminBackButton withConfirm={form.formState.isDirty} />}
          rightActions={
            <>
              <AdminCancelButton withConfirm={form.formState.isDirty} />
              <Button
                type="submit"
                variant="@primary"
                isLoading={createUser.isLoading || createUser.isSuccess}
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
    </Form>
  );
}
