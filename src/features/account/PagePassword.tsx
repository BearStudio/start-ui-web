import React from 'react';

import { Button, Card, CardBody, Flex, Heading, Stack } from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import { useTranslation } from 'react-i18next';

import { FieldInput } from '@/components/FieldInput';
import { Page, PageContent } from '@/components/Page';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { AccountNav } from '@/features/account/AccountNav';
import { trpc } from '@/lib/trpc/client';

export default function PagePassword() {
  const { t } = useTranslation(['account']);

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const updatePassword = trpc.account.updatePassword.useMutation({
    onError: (error) => {
      if (error.data?.code === 'UNAUTHORIZED') {
        changePasswordForm.setErrors({
          currentPassword: t('account:data.currentPassword.invalid'),
        });
      }
      toastError({
        title: t('account:password.feedbacks.updateError.title'),
      });
    },
    onSuccess: () => {
      toastSuccess({
        title: t('account:password.feedbacks.updateSuccess.title'),
      });
      changePasswordForm.reset();
    },
  });

  const changePasswordForm = useForm<{
    currentPassword: string;
    newPassword: string;
  }>({
    onValidSubmit: (values) => {
      updatePassword.mutate(values);
    },
  });
  const values = useFormFields({
    connect: changePasswordForm,
    fields: ['newPassword'] as const,
    selector: (field) => field.value,
  });

  return (
    <Page nav={<AccountNav />}>
      <PageContent>
        <Heading size="md" mb="4">
          {t('account:password.title')}
        </Heading>
        <Card>
          <Formiz connect={changePasswordForm}>
            <form noValidate onSubmit={changePasswordForm.submit}>
              <CardBody>
                <Stack spacing={4}>
                  <FieldInput
                    name="currentPassword"
                    type="password"
                    label={t('account:data.currentPassword.label')}
                    required={t('account:data.currentPassword.required')}
                  />
                  <FieldInput
                    name="newPassword"
                    type="password"
                    label={t('account:data.newPassword.label')}
                    required={t('account:data.newPassword.required')}
                  />
                  <FieldInput
                    name="confirmNewPassword"
                    type="password"
                    label={t('account:data.confirmNewPassword.label')}
                    required={t('account:data.confirmNewPassword.required')}
                    validations={[
                      {
                        handler: (value) => value === values?.newPassword,
                        message: t('account:data.confirmNewPassword.notEqual'),
                        deps: [values?.newPassword],
                      },
                    ]}
                  />
                  <Flex>
                    <Button
                      type="submit"
                      variant="@primary"
                      ms="auto"
                      isLoading={updatePassword.isLoading}
                    >
                      {t('account:password.actions.changePassword')}
                    </Button>
                  </Flex>
                </Stack>
              </CardBody>
            </form>
          </Formiz>
        </Card>
      </PageContent>
    </Page>
  );
}
