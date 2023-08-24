import React from 'react';

import {
  Button,
  ButtonGroup,
  Heading,
  SkeletonText,
  Text,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

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
import {
  useRepositoryFormQuery,
  useRepositoryUpdate,
} from '@/features/repositories/api.client';
import { Loader } from '@/layout/Loader';

export default function PageRepositoryUpdate() {
  const { t } = useTranslation(['common', 'repositories']);

  const params = useParams();
  const navigate = useNavigate();
  const repository = useRepositoryFormQuery(Number(params?.id));

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const updateRepository = useRepositoryUpdate({
    onError: (error) => {
      if (error.status === 400) {
        const { title, errorKey } = error.body;

        toastError({
          title: t('repositories:update.feedbacks.updateError.title'),
          description: title,
        });
        if (errorKey === 'name_already_used') {
          form.setErrors({
            name: t('repositories:data.name.alreadyUsed'),
          });
        }
      }
    },
    onSuccess: () => {
      toastSuccess({
        title: t('repositories:update.feedbacks.updateSuccess.title'),
      });
      navigate(-1);
    },
  });

  const form = useForm<RepositoryFormFields>({
    ready: !repository.isLoading,
    initialValues: repository.data?.body,
    onValidSubmit: (values) => {
      if (!repository.data?.body.id) return null;
      updateRepository.mutate({
        body: {
          ...repository.data.body,
          ...values,
        },
      });
    },
  });

  return (
    <Page containerSize="md" isFocusMode>
      <PageTopBar showBack onBack={() => navigate(-1)}>
        {repository.isLoading && <SkeletonText maxW="6rem" noOfLines={2} />}
        {repository.isSuccess && (
          <>
            <Heading size="md">{repository.data?.body.name}</Heading>
            <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.300' }}>
              {t('repositories:data.id.label')}: {repository.data?.body.id}
            </Text>
          </>
        )}
      </PageTopBar>
      {repository.isLoading && <Loader />}
      {repository.isError && <ErrorPage />}
      {repository.isSuccess && (
        <Formiz connect={form}>
          <form noValidate onSubmit={form.submit}>
            <PageContent>
              <RepositoryForm />
            </PageContent>
            <PageBottomBar>
              <ButtonGroup justifyContent="space-between">
                <Button onClick={() => navigate('/repositories')}>
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
