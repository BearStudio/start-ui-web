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
import { useToastError, useToastSuccess } from '@/components/Toast';
import { useUser, useUserUpdate } from '@/spa/admin/users/users.service';
import {
  Loader,
  Page,
  PageBottomBar,
  PageContent,
  PageTopBar,
} from '@/spa/layout';

import { UserForm } from './UserForm';
import { UserStatus } from './UserStatus';

export const PageUserUpdate = () => {
  const { t } = useTranslation();

  const { login } = useParams();
  const navigate = useNavigate();
  const {
    user,
    isLoading: userIsLoading,
    isFetching: userIsFetching,
    isError: userIsError,
  } = useUser(login, { refetchOnWindowFocus: false });

  const form = useForm({ subscribe: false });

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const { mutate: editUser, isLoading: editUserIsLoading } = useUserUpdate({
    onError: (error) => {
      if (error.response) {
        const { title, errorKey } = error.response.data;
        toastError({
          title: t('users:update.feedbacks.updateError.title'),
          description: title,
        });
        switch (errorKey) {
          case 'userexists':
            form.invalidateFields({
              login: t('users:data.login.alreadyUsed'),
            });
            break;
          case 'emailexists':
            form.invalidateFields({
              email: t('users:data.email.alreadyUsed'),
            });
            break;
        }
      }
    },
    onSuccess: () => {
      toastSuccess({
        title: t('users:update.feedbacks.updateSuccess.title'),
      });
      navigate(-1);
    },
  });
  const submitEditUser = (values: any) => {
    const userToSend = {
      id: user?.id,
      ...values,
    };
    editUser(userToSend);
  };

  return (
    <Page containerSize="md" isFocusMode>
      <PageTopBar showBack onBack={() => navigate(-1)}>
        <HStack spacing="4">
          <Box flex="1">
            {userIsLoading || userIsError ? (
              <SkeletonText maxW="6rem" noOfLines={2} />
            ) : (
              <Stack spacing="0">
                <Heading size="sm">{user?.login}</Heading>
                <Text
                  fontSize="xs"
                  color="gray.600"
                  _dark={{ color: 'gray.300' }}
                >
                  {t('users:data.id.label')}: {user?.id}
                </Text>
              </Stack>
            )}
          </Box>
          {!!user && (
            <Box>
              <UserStatus isActivated={user?.activated} />
            </Box>
          )}
        </HStack>
      </PageTopBar>
      {userIsFetching && <Loader />}
      {userIsError && !userIsFetching && <ErrorPage errorCode={404} />}
      {!userIsError && !userIsFetching && (
        <Formiz
          id="create-user-form"
          onValidSubmit={submitEditUser}
          connect={form}
          initialValues={user}
        >
          <form noValidate onSubmit={form.submit}>
            <PageContent>
              <UserForm />
            </PageContent>
            <PageBottomBar>
              <ButtonGroup justifyContent="space-between">
                <Button onClick={() => navigate(-1)}>
                  {t('actions.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="@primary"
                  isLoading={editUserIsLoading}
                >
                  {t('users:update.action.save')}
                </Button>
              </ButtonGroup>
            </PageBottomBar>
          </form>
        </Formiz>
      )}
    </Page>
  );
};
