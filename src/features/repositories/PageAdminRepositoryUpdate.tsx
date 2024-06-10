import React from 'react';

import { Button, Heading, SkeletonText, Stack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ErrorPage } from '@/components/ErrorPage';
import { Form } from '@/components/Form';
import { LoaderFull } from '@/components/LoaderFull';
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

export default function PageAdminRepositoryUpdate() {
  const { t } = useTranslation(['common', 'repositories']);
  const trpcUtils = trpc.useUtils();

  const params = useParams();
  const router = useRouter();
  const repository = trpc.repositories.getById.useQuery(
    {
      id: params?.id?.toString() ?? '',
    },
    {
      staleTime: Infinity,
    }
  );

  const isReady = !repository.isFetching;

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const updateRepository = trpc.repositories.updateById.useMutation({
    onSuccess: async () => {
      await trpcUtils.repositories.invalidate();
      toastSuccess({
        title: t('repositories:update.feedbacks.updateSuccess.title'),
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
        title: t('repositories:update.feedbacks.updateError.title'),
      });
    },
  });

  const form = useForm<FormFieldsRepository>({
    resolver: zodResolver(zFormFieldsRepository()),
    values: {
      name: repository.data?.name ?? '',
      link: repository.data?.link ?? '',
      description: repository.data?.description,
    },
  });

  return (
    <Form
      {...form}
      onSubmit={(values) => {
        if (!repository.data?.id) return;
        updateRepository.mutate({
          id: repository.data.id,
          ...values,
        });
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
                  updateRepository.isLoading || updateRepository.isSuccess
                }
              >
                {t('repositories:update.action.save')}
              </Button>
            </>
          }
        >
          <Stack flex={1} spacing={0}>
            {repository.isLoading && <SkeletonText maxW="6rem" noOfLines={2} />}
            {repository.isSuccess && (
              <Heading size="sm">{repository.data?.name}</Heading>
            )}
          </Stack>
        </AdminLayoutPageTopBar>
        {!isReady && <LoaderFull />}
        {isReady && repository.isError && <ErrorPage />}
        {isReady && repository.isSuccess && (
          <AdminLayoutPageContent>
            <RepositoryForm />
          </AdminLayoutPageContent>
        )}
      </AdminLayoutPage>
    </Form>
  );
}
