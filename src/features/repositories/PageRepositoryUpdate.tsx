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
import {
  Page,
  PageBottomBar,
  PageContent,
  PageTopBar,
} from '@/components/Page';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  RepositoryForm,
  RepositoryFormFields,
} from '@/features/repositories/RepositoryForm';
import { Loader } from '@/layout/Loader';
import { trpc } from '@/lib/trpc/client';

export default function PageRepositoryUpdate() {
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
      if (error.data?.code === 'CONFLICT') {
        form.setErrors({ email: t('repositories:data.name.alreadyUsed') });
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
    <Page containerSize="md" isFocusMode>
      <PageTopBar showBack onBack={() => router.back()}>
        {repository.isLoading && <SkeletonText maxW="6rem" noOfLines={2} />}
        {repository.isSuccess && (
          <>
            <Heading size="md">{repository.data?.name}</Heading>
            <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.300' }}>
              {t('repositories:data.id.label')}: {repository.data?.id}
            </Text>
          </>
        )}
      </PageTopBar>
      {!isReady && <Loader />}
      {isReady && repository.isError && <ErrorPage />}
      {isReady && repository.isSuccess && (
        <Formiz connect={form}>
          <form noValidate onSubmit={form.submit}>
            <PageContent>
              <RepositoryForm />
            </PageContent>
            <PageBottomBar>
              <ButtonGroup justifyContent="space-between">
                <Button onClick={() => router.back()}>
                  {t('common:actions.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="@primary"
                  isLoading={updateRepository.isLoading}
                >
                  {t('repositories:update.action.save')}
                </Button>
              </ButtonGroup>
            </PageBottomBar>
          </form>
        </Formiz>
      )}
    </Page>
  );
}
