import React from 'react';

import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { isMaxLength, isMinLength } from '@formiz/validations';
import { useHistory } from 'react-router-dom';

import { useResetPasswordFinish } from '@/app/account/account.service';
import { useSearchParams } from '@/app/router';
import {
  FieldInput,
  SlideIn,
  useToastError,
  useToastSuccess,
} from '@/components';

export const PageResetPasswordConfirm = () => {
  const { searchParams } = useSearchParams();

  const resetPasswordFinishForm = useForm();
  const history = useHistory();

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const {
    mutate: resetPasswordFinish,
    isLoading: resetPasswordLoading,
  } = useResetPasswordFinish({
    onError: (error: any) => {
      const { title } = error?.response?.data || {};
      toastError({
        title: 'Reset password failed',
        description: title,
      });
    },
    onSuccess: () => {
      toastSuccess({
        title: 'Your password have been reset',
        description: 'You can now login you',
      });
      history.push('/login');
    },
  });

  const submitResetPasswordFinish = async (values) => {
    await resetPasswordFinish({
      key: searchParams.get('key'),
      newPassword: values.password,
    });
  };

  return (
    <SlideIn>
      <Box p="2" pb="4rem" w="20rem" maxW="full" m="auto">
        <Box p="6" bg="white" borderRadius="md" boxShadow="md">
          <Heading size="lg">Reset password</Heading>
          <Formiz
            id="reset-password-finish-form"
            onValidSubmit={submitResetPasswordFinish}
            connect={resetPasswordFinishForm}
          >
            <form noValidate onSubmit={resetPasswordFinishForm.submit}>
              <FieldInput
                name="password"
                label="New password"
                type="password"
                my="6"
                required="Password is required"
                validations={[
                  {
                    rule: isMinLength(4),
                    message: 'Password too short (min. 4 characters)',
                  },
                  {
                    rule: isMaxLength(50),
                    message: 'Password too long (max. 50 characters)',
                  },
                ]}
              />
              <FieldInput
                name="confirmPassword"
                label="Confirm password"
                type="password"
                my="6"
                required="Password confirmation is required"
                validations={[
                  {
                    rule: isMinLength(4),
                    message: 'Password too short (min. 4 characters)',
                  },
                  {
                    rule: isMaxLength(50),
                    message: 'Password too long (max. 50 characters)',
                  },
                  {
                    rule: (value) =>
                      value === resetPasswordFinishForm?.values?.password,
                    message: 'Passwords must be equal',
                    deps: [resetPasswordFinishForm?.values?.password],
                  },
                ]}
              />
              <Flex>
                <Button
                  type="submit"
                  variant="@primary"
                  ml="auto"
                  isLoading={resetPasswordLoading}
                >
                  Reset password
                </Button>
              </Flex>
            </form>
          </Formiz>
        </Box>
      </Box>
    </SlideIn>
  );
};
