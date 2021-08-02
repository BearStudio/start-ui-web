import React from 'react';

import {
  Text,
  Box,
  Heading,
  HStack,
  Stack,
  Button,
  ButtonGroup,
  SkeletonText,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useParams, useHistory } from 'react-router-dom';

import { useUser, useUserUpdate } from '@/app/admin/users/users.service';
import {
  Page,
  PageContent,
  PageBottomBar,
  PageTopBar,
  Loader,
} from '@/app/layout';
import { useToastError, useToastSuccess } from '@/components';
import { useDarkMode } from '@/hooks/useDarkMode';

import { UserForm } from './UserForm';
import { UserStatus } from './UserStatus';

export const PageUserUpdate = () => {
  const { t } = useTranslation();
  const { colorModeValue } = useDarkMode();
  const { login } = useParams();
  const history = useHistory();
  const {
    user,
    isLoading: userIsLoading,
    isFetching: userIsFetching,
  } = useUser(login, { refetchOnWindowFocus: false });

  const form = useForm({ subscribe: false });

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const { mutate: editUser, isLoading: editUserIsLoading } = useUserUpdate({
    onError: (error: AxiosError) => {
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
    },
    onSuccess: () => {
      toastSuccess({
        title: t('users:update.feedbacks.updateSuccess.title'),
      });
      history.goBack();
    },
  });
  const submitEditUser = (values) => {
    const userToSend = {
      id: user?.id,
      ...values,
    };
    editUser(userToSend);
  };

  return (
    <Page containerSize="md" isFocusMode>
      <PageTopBar showBack onBack={() => history.goBack()}>
        <HStack spacing="4">
          <Box flex="1">
            {userIsLoading ? (
              <SkeletonText maxW="6rem" noOfLines={2} />
            ) : (
              <Stack spacing="0">
                <Heading size="sm">{user?.login}</Heading>
                <Text
                  fontSize="xs"
                  color={colorModeValue('gray.600', 'gray.300')}
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
      {userIsFetching ? (
        <Loader />
      ) : (
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
                <Button onClick={() => history.goBack()}>
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
