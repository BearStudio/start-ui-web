import React from 'react';

import { Button, Flex, Heading, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { isMaxLength, isMinLength } from '@formiz/validations';
import { useTranslation } from 'react-i18next';

import { AccountNav } from '@/app/account/AccountNav';
import { useUpdatePassword } from '@/app/account/account.service';
import { Page, PageContent } from '@/app/layout';
import { FieldInput, useToastError, useToastSuccess } from '@/components';
import { useDarkMode } from '@/hooks/useDarkMode';

export const PagePassword = () => {
  const { t } = useTranslation();
  const { colorModeValue } = useDarkMode();
  const changePasswordForm = useForm();

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const {
    mutate: changePasswordFinish,
    isLoading: changePasswordLoading,
  } = useUpdatePassword({
    onError: (error: any) => {
      const { title } = error?.response?.data || {};
      if (title === 'Incorrect password') {
        changePasswordForm.invalidateFields({
          currentPassword: t('account:data.currentPassword.incorrect'),
        });
        return;
      }
      toastError({
        title: t('account:password.feedbacks.updateError.title'),
        description: title,
      });
    },
    onSuccess: () => {
      toastSuccess({
        title: t('account:password.feedbacks.updateSuccess.title'),
      });
      changePasswordForm.reset();
    },
  });

  const submitUpdatePassword = async (values) => {
    const { currentPassword, newPassword } = values;

    await changePasswordFinish({ currentPassword, newPassword });
  };

  const passwordValidations = [
    {
      rule: isMinLength(4),
      message: t('account:data.password.tooShort', { min: 4 }),
    },
    {
      rule: isMaxLength(50),
      message: t('account:data.password.tooLong', { max: 50 }),
    },
  ];

  return (
    <Page nav={<AccountNav />}>
      <PageContent>
        <Heading size="md" mb="4">
          {t('account:password.title')}
        </Heading>
        <Formiz
          id="password-form"
          onValidSubmit={submitUpdatePassword}
          connect={changePasswordForm}
        >
          <form noValidate onSubmit={changePasswordForm.submit}>
            <Stack
              direction="column"
              bg={colorModeValue('white', 'blackAlpha.400')}
              p="6"
              borderRadius="lg"
              spacing="6"
              shadow="md"
            >
              <FieldInput
                name="currentPassword"
                type="password"
                label={t('account:data.currentPassword.label')}
                required={t('account:data.currentPassword.required') as string}
                validations={passwordValidations}
              />
              <FieldInput
                name="newPassword"
                type="password"
                label={t('account:data.newPassword.label')}
                required={t('account:data.newPassword.required') as string}
                validations={passwordValidations}
              />
              <FieldInput
                name="confirmNewPassword"
                type="password"
                label={t('account:data.confirmNewPassword.label')}
                required={
                  t('account:data.confirmNewPassword.required') as string
                }
                validations={[
                  ...passwordValidations,
                  {
                    rule: (value) =>
                      value === changePasswordForm?.values?.newPassword,
                    message: t('account:data.confirmNewPassword.notEqual'),
                    deps: [changePasswordForm?.values?.newPassword],
                  },
                ]}
              />
              <Flex>
                <Button
                  type="submit"
                  variant="@primary"
                  ms="auto"
                  isLoading={changePasswordLoading}
                >
                  {t('account:password.actions.changePassword')}
                </Button>
              </Flex>
            </Stack>
          </form>
        </Formiz>
      </PageContent>
    </Page>
  );
};
