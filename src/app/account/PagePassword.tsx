import React from 'react';

import { Button, Flex, Heading, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { isMaxLength, isMinLength } from '@formiz/validations';

import { AccountNav } from '@/app/account/AccountNav';
import { useUpdatePassword } from '@/app/account/account.service';
import { Page, PageContent } from '@/app/layout';
import { FieldInput, useToastError, useToastSuccess } from '@/components';

export const PagePassword = () => {
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
          currentPassword: 'Invalid current password',
        });
        return;
      }
      toastError({
        title: 'Change password failed',
        description: title,
      });
    },
    onSuccess: () => {
      toastSuccess({
        title: 'Your password changed with success',
      });
      changePasswordForm.reset();
    },
  });

  const submitUpdatePassword = async (values) => {
    const { currentPassword, newPassword } = values;

    await changePasswordFinish({ currentPassword, newPassword });
  };

  return (
    <Page nav={<AccountNav />}>
      <PageContent>
        <Heading size="md" mb="4">
          Password
        </Heading>
        <Formiz
          id="password-form"
          onValidSubmit={submitUpdatePassword}
          connect={changePasswordForm}
        >
          <form noValidate onSubmit={changePasswordForm.submit}>
            <Stack
              direction="column"
              bg="white"
              p="6"
              borderRadius="lg"
              spacing="6"
              shadow="md"
            >
              <FieldInput
                name="currentPassword"
                label="Current password"
                type="password"
                required="This field is required"
                validations={[
                  { rule: isMinLength(4), message: 'Password is too short' },
                  { rule: isMaxLength(50), message: 'Password is too long' },
                ]}
              />
              <FieldInput
                name="newPassword"
                label="New password"
                type="password"
                required="This field is required"
                validations={[
                  { rule: isMinLength(4), message: 'Password is too short' },
                  { rule: isMaxLength(50), message: 'Password is too long' },
                ]}
              />
              <FieldInput
                name="confirmNewPassword"
                label="New password confirmation"
                type="password"
                required="This field is required"
                validations={[
                  { rule: isMinLength(4), message: 'Password is too short' },
                  { rule: isMaxLength(50), message: 'Password is too long' },
                  {
                    rule: (value) =>
                      value === changePasswordForm?.values?.newPassword,
                    message: 'Passwords must be equal',
                    deps: [changePasswordForm?.values?.newPassword],
                  },
                ]}
              />
              <Flex>
                <Button
                  type="submit"
                  colorScheme="brand"
                  ml="auto"
                  isLoading={changePasswordLoading}
                >
                  Change password
                </Button>
              </Flex>
            </Stack>
          </form>
        </Formiz>
      </PageContent>
    </Page>
  );
};
