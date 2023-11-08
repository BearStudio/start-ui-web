import React from 'react';

import { Button, Heading, SkeletonText, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { ErrorPage } from '@/components/ErrorPage';
import { LoaderFull } from '@/components/LoaderFull';
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
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
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
        form.setErrors({ name: t('repositories:data.name.alreadyUsed') });
        return;
      }
      toastError({
        title: t('repositories:update.feedbacks.updateError.title'),
      });
    },
  });

  const form = useForm<RepositoryFormFields>({
    ready: isReady,
    initialValues: repository.data,
    onValidSubmit: (values) => {
      if (!repository.data?.id) return;
      updateRepository.mutate({
        ...repository.data,
        ...values,
      });
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
                  updateRepository.isLoading || updateRepository.isSuccess
                }
                isDisabled={!form.isValid && form.isSubmitted}
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
    </Formiz>
  );
}
