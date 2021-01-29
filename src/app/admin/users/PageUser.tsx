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
import { isMinLength } from '@formiz/validations';
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
import {
  FieldBooleanCheckbox,
  FieldGroupCheckbox,
  FieldInput,
  FieldSelect,
  useToastError,
  useToastSuccess,
} from '@/components';

import { UserStatus } from './UserStatus';

export const AUTHORITIES = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
};

export const PageUser = () => {
  const { login } = useParams();
  const history = useHistory();
  const { user, isSuccess: userSuccess, isLoading: userIsLoading } = useUser(
    login
  );
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

  const languages = [{ label: 'English', value: 'en' }];

  const authorities = Object.values(AUTHORITIES).map((value) => ({ value }));

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
            <Stack spacing={userSuccess ? '0rem' : '0.5rem'}>
              <SkeletonText
                isLoaded={userSuccess}
                maxW={userSuccess ? undefined : '6rem'}
                noOfLines={1}
              >
                <Heading size="sm">{user?.login}</Heading>
              </SkeletonText>
              <SkeletonText
                isLoaded={userSuccess}
                maxW={userSuccess ? undefined : '6rem'}
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
      {userIsLoading ? (
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
              <Stack
                direction="column"
                bg="white"
                p="6"
                borderRadius="lg"
                spacing="6"
                shadow="md"
              >
                <FieldInput
                  name="login"
                  label="Login"
                  required="This field is required"
                />
                <Stack direction={{ base: 'column', sm: 'row' }} spacing="6">
                  <FieldInput name="firstName" label="First Name" />
                  <FieldInput name="lastName" label="Last Name" />
                </Stack>
                <FieldInput
                  name="email"
                  label="Email"
                  required="This field is required"
                />
                <FieldBooleanCheckbox
                  name="activated"
                  label="Account activation"
                  description="Activated"
                />
                <FieldSelect
                  name="langKey"
                  label="Language"
                  options={languages}
                />
                <FieldGroupCheckbox
                  name="authorities"
                  label="Authorities"
                  options={authorities}
                  isRequired
                  validations={[
                    {
                      rule: isMinLength(1),
                      message: 'Choose at least one role',
                    },
                  ]}
                />
              </Stack>
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
