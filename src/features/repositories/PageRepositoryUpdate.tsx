import React from 'react';

import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  Heading,
  SkeletonText,
  Stack,
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
import { RepositoryForm } from '@/features/repositories/RepositoryForm';
import {
  useRepositoryFormQuery,
  useRepositoryUpdate,
} from '@/features/repositories/service';
import { Loader } from '@/layout/Loader';

export default function PageRepositoryUpdate() {
  const { t } = useTranslation(['common', 'repositories']);

  const params = useParams();
  const navigate = useNavigate();
  const repository = useRepositoryFormQuery(Number(params?.id));

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const { mutate: editUser, isLoading: editUserIsLoading } =
    useRepositoryUpdate({
      onError: (error) => {
        if (error.response) {
          const { title } = error.response.data;
          toastError({
            title: t('repositories:update.feedbacks.updateError.title'),
            description: title,
          });
        }
      },
      onSuccess: () => {
        toastSuccess({
          title: t('repositories:update.feedbacks.updateSuccess.title'),
        });
        navigate(-1);
      },
    });

  const form = useForm<TODO>({
    id: 'create - user - form',
    ready: !repository.isLoading,
    initialValues: repository.data,
    onValidSubmit: (values) => {
      const userToSend = {
        id: repository.data?.id,
        ...values,
      };
      editUser(userToSend);
    },
  });

  return (
    <Page containerSize="md" isFocusMode>
      <PageTopBar showBack onBack={() => navigate('/repositories')}>
        <HStack spacing="4">
          <Box flex="1">
            {repository.isLoading || repository.isError ? (
              <SkeletonText maxW="6rem" noOfLines={2} />
            ) : (
              <Stack spacing="0">
                <Heading size="sm">{repository.data?.name}</Heading>
                <Text
                  fontSize="xs"
                  color="gray.600"
                  _dark={{ color: 'gray.300' }}
                >
                  {t('repositories:data.id.label')}: {repository.data?.id}
                </Text>
              </Stack>
            )}
          </Box>
        </HStack>
      </PageTopBar>
      {repository.isLoading && <Loader />}
      {repository.isError && !repository.isLoading && (
        <ErrorPage errorCode={404} />
      )}
      {!repository.isError && !repository.isLoading && (
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
                  isLoading={editUserIsLoading}
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
