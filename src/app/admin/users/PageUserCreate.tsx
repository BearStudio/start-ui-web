import React from 'react';

import { Button, ButtonGroup, Heading } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useHistory } from 'react-router-dom';

import { UserForm } from '@/app/admin/users/UserForm';
import { useUserCreate } from '@/app/admin/users/users.service';
import { Page, PageContent, PageBottomBar, PageTopBar } from '@/app/layout';
import { useToastError, useToastSuccess } from '@/components';

export const PageUserCreate = () => {
  const history = useHistory();
  const createUserForm = useForm();

  const toastError = useToastError();
  const toastSuccess = useToastSuccess();

  const { mutate: createUser, isLoading: createUserLoading } = useUserCreate({
    onError: (error: any) => {
      const { title, errorKey } = error?.response?.data || {};
      toastError({
        title: 'Creation failed',
        description: title,
      });
      switch (errorKey) {
        case 'userexists':
          createUserForm.invalidateFields({
            login: 'Login already used',
          });
          break;
        case 'emailexists':
          createUserForm.invalidateFields({
            email: 'Email already used',
          });
          break;
      }
    },
    onSuccess: () => {
      toastSuccess({
        title: 'User created with success',
      });
      history.push('/admin/users');
    },
  });

  const submitCreateUser = async (values) => {
    const newUser = {
      ...values,
    };
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
            <UserForm />
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
