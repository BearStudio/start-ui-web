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
import { useQueryClient } from 'react-query';
import { useParams, useHistory } from 'react-router-dom';

import { useUser, useUserUpdate } from '@/app/admin/users/service';
import {
  Page,
  PageContent,
  PageBottomBar,
  PageTopBar,
  Loader,
} from '@/app/layout';
import { useToastError, useToastSuccess } from '@/components';

import { UserForm } from './UserForm';
import { UserStatus } from './UserStatus';

export const PageUser = () => {
  const { login } = useParams();
  const history = useHistory();
  const {
    user,
    isLoading: userIsLoading,
    isFetching: userIsFetching,
  } = useUser(login, { refetchOnWindowFocus: false });
  const queryClient = useQueryClient();

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const { mutate: editUser, isLoading: editUserIsLoading } = useUserUpdate({
    onError: (error: any) => {
      const { title } = error?.response?.data || {};
      toastError({
        title: 'Update failed',
        description: title,
      });
    },
    onSuccess: () => {
      toastSuccess({
        title: 'Updated with success',
      });
      queryClient.invalidateQueries('user');
      history.goBack();
    },
  });
  const editUserForm = useForm();
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
            <Stack spacing={!userIsLoading ? '0rem' : '0.5rem'}>
              <SkeletonText
                isLoaded={!userIsLoading}
                maxW={!userIsLoading ? undefined : '6rem'}
                noOfLines={1}
              >
                <Heading size="sm">{user?.login}</Heading>
              </SkeletonText>
              <SkeletonText
                isLoaded={!userIsLoading}
                maxW={!userIsLoading ? undefined : '6rem'}
                noOfLines={1}
              >
                <Text fontSize="xs" color="gray.600">
                  {'ID : ' + user?.id}
                </Text>
              </SkeletonText>
            </Stack>
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
          connect={editUserForm}
          initialValues={user}
        >
          <form noValidate onSubmit={editUserForm.submit}>
            <PageContent>
              <UserForm />
            </PageContent>
            <PageBottomBar>
              <ButtonGroup justifyContent="space-between">
                <Button onClick={() => history.goBack()}>Cancel</Button>
                <Button
                  type="submit"
                  colorScheme="brand"
                  isLoading={editUserIsLoading}
                >
                  Edit User
                </Button>
              </ButtonGroup>
            </PageBottomBar>
          </form>
        </Formiz>
      )}
    </Page>
  );
};
