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
import { RepositoryForm } from '@/features/repositories/RepositoryForm';
import {
  FormFieldsRepository,
  zFormFieldsRepository,
} from '@/features/repositories/schemas';
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
        form.setError('name', {
          message: t('repositories:data.name.alreadyUsed'),
        });
        return;
      }
      toastError({
        title: t('repositories:create.feedbacks.updateError.title'),
      });
    },
  });

  const form = useForm<FormFieldsRepository>({
    resolver: zodResolver(zFormFieldsRepository()),
    defaultValues: {
      name: '',
      link: '',
      description: '',
    },
  });

  return (
    <Form
      {...form}
      onSubmit={(values) => {
        createRepository.mutate(values);
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
                isLoading={
                  createRepository.isLoading || createRepository.isSuccess
                }
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
    </Form>
  );
}
