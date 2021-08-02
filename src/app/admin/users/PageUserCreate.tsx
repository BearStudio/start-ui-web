import React from 'react';

import { Button, ButtonGroup, Heading } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { UserForm } from '@/app/admin/users/UserForm';
import { useUserCreate } from '@/app/admin/users/users.service';
import { Page, PageContent, PageBottomBar, PageTopBar } from '@/app/layout';
import { useToastError, useToastSuccess } from '@/components';

export const PageUserCreate = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const form = useForm({ subscribe: false });

  const toastError = useToastError();
  const toastSuccess = useToastSuccess();

  const { mutate: createUser, isLoading: createUserLoading } = useUserCreate({
    onError: (error: AxiosError) => {
      const { title, errorKey } = error.response.data;
      toastError({
        title: t('users:create.feedbacks.updateError.title'),
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
        title: t('users:create.feedbacks.updateSuccess.title'),
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
        connect={form}
      >
        <form noValidate onSubmit={form.submit}>
          <PageTopBar showBack onBack={() => history.goBack()}>
            <Heading size="md">{t('users:create.title')}</Heading>
          </PageTopBar>
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
                isLoading={createUserLoading}
              >
                {t('users:create.action.save')}
              </Button>
            </ButtonGroup>
          </PageBottomBar>
        </form>
      </Formiz>
    </Page>
  );
};
