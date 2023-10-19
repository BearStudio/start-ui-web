import React from 'react';

import {
  Button,
  ButtonGroup,
  Heading,
  SkeletonText,
  Text,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { ErrorPage } from '@/components/ErrorPage';
import { LoaderFull } from '@/components/LoaderFull';
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

export default function PageAdminRepositoryUpdate() {
  const { t } = useTranslation(['common', 'repositories']);
  const trpcContext = trpc.useContext();

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
      await trpcContext.repositories.invalidate();
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
    <AdminLayoutPage containerMaxWidth="container.md" showNavBar={false}>
      <AdminLayoutPageTopBar showBack onBack={() => router.back()}>
        {repository.isLoading && <SkeletonText maxW="6rem" noOfLines={2} />}
        {repository.isSuccess && (
          <>
            <Heading size="md">{repository.data?.name}</Heading>
            <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.300' }}>
              {t('repositories:data.id.label')}: {repository.data?.id}
            </Text>
          </>
        )}
      </AdminLayoutPageTopBar>
      {!isReady && <LoaderFull />}
      {isReady && repository.isError && <ErrorPage />}
      {isReady && repository.isSuccess && (
        <Formiz connect={form}>
          <form noValidate onSubmit={form.submit}>
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
                    updateRepository.isLoading || updateRepository.isSuccess
                  }
                >
                  {t('repositories:update.action.save')}
                </Button>
              </ButtonGroup>
            </AdminLayoutPageBottomBar>
          </form>
        </Formiz>
      )}
    </AdminLayoutPage>
  );
}
