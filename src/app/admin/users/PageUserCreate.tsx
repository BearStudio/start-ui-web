import React from 'react';

import { Button, ButtonGroup, Heading, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useHistory } from 'react-router-dom';

import { useUserCreate } from '@/app/admin/users/service';
import { Page, PageContent, PageBottomBar, PageTopBar } from '@/app/layout';
import {
  FieldGroupCheckbox,
  FieldInput,
  FieldSelect,
  useToastError,
  useToastSuccess,
} from '@/components';

export const AUTHORITIES = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
};

export const PageUserCreate = () => {
  const history = useHistory();
  const createUserForm = useForm();

  const toastError = useToastError();
  const toastSuccess = useToastSuccess();

  const { mutate: createUser, isLoading: createUserLoading } = useUserCreate({
    onError: (error: any) => {
      const { description } = error?.response?.data || {};
      toastError({
        title: 'Creation failed',
        description,
      });
    },
    onSuccess: () => {
      toastSuccess({
        title: 'User created with success',
      });
      history.push('/admin/users');
    },
  });

  const languages = [{ label: 'English', value: 'en' }];

  const authorities = Object.values(AUTHORITIES).map((value) => ({ value }));

  const submitCreateUser = async (values) => {
    const newUser = {
      ...values,
    };
    console.log(newUser);
    await createUser(newUser);
  };

  return (
    <Page containerSize="md" isFocusMode>
      <Formiz
        id="create-user-form"
        onValidSubmit={submitCreateUser}
        connect={createUserForm}
      >
        <form noValidate onSubmit={createUserForm.submit}>
          <PageTopBar showBack onBack={() => history.goBack()}>
            <Heading size="md">Create a new user</Heading>
          </PageTopBar>
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
                <FieldInput
                  name="firstName"
                  label="First Name"
                  required="This field is required"
                />
                <FieldInput
                  name="lastName"
                  label="Last Name"
                  required="This field is required"
                />
              </Stack>
              <FieldInput
                name="email"
                label="Email"
                required="This field is required"
              />
              <FieldSelect
                name="langKey"
                label="Language"
                options={languages}
                defaultValue={'en'}
              />
              <FieldGroupCheckbox
                name="authorities"
                label="Authorities"
                options={authorities}
                isRequired
                validations={[
                  {
                    rule: (value) => value?.length >= 1,
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
                isLoading={createUserLoading}
              >
                Create User
              </Button>
            </ButtonGroup>
          </PageBottomBar>
        </form>
      </Formiz>
    </Page>
  );
};
