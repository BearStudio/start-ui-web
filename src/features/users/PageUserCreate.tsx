import React from 'react';

import { Button, ButtonGroup, Heading } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  Page,
  PageBottomBar,
  PageContent,
  PageTopBar,
} from '@/components/Page';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { UserForm } from '@/features/users/UserForm';
import { User } from '@/features/users/schema';
import { useUserCreate } from '@/features/users/service';

export default function PageUserCreate() {
  const { t } = useTranslation(['common', 'users']);
  const navigate = useNavigate();

  const toastError = useToastError();
  const toastSuccess = useToastSuccess();

  const createUser = useUserCreate({
    onError: (error) => {
      if (error.response) {
        const { title, errorKey } = error.response.data;
        toastError({
          title: t('users:create.feedbacks.updateError.title'),
          description: title,
        });
        switch (errorKey) {
          case 'userexists':
            form.setErrors({
              login: t('users:data.login.alreadyUsed'),
            });
            break;
          case 'emailexists':
            form.setErrors({
              email: t('users:data.email.alreadyUsed'),
            });
            break;
        }
      }
    },
    onSuccess: () => {
      toastSuccess({
        title: t('users:create.feedbacks.updateSuccess.title'),
      });
      navigate('../');
    },
  });

  const form = useForm<
    Pick<
      User,
      'login' | 'email' | 'firstName' | 'lastName' | 'langKey' | 'authorities'
    >
  >({
    onValidSubmit: (values) => {
      const newUser = {
        ...values,
      };
      createUser.mutate(newUser);
    },
  });

  return (
    <Page containerSize="md" isFocusMode>
      <Formiz connect={form}>
        <form noValidate onSubmit={form.submit}>
          <PageTopBar showBack onBack={() => navigate('../')}>
            <Heading size="md">{t('users:create.title')}</Heading>
          </PageTopBar>
          <PageContent>
            <UserForm />
          </PageContent>
          <PageBottomBar>
            <ButtonGroup justifyContent="space-between">
              <Button onClick={() => navigate('../')}>
                {t('common:actions.cancel')}
              </Button>
              <Button
                type="submit"
                variant="@primary"
                isLoading={createUser.isLoading}
              >
                {t('users:create.action.save')}
              </Button>
            </ButtonGroup>
          </PageBottomBar>
        </form>
      </Formiz>
    </Page>
  );
}
