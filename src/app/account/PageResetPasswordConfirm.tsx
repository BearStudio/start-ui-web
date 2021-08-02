import React from 'react';

import { Box, Button, Flex, Heading, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { isMaxLength, isMinLength } from '@formiz/validations';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { useResetPasswordFinish } from '@/app/account/account.service';
import { useSearchParams } from '@/app/router';
import {
  FieldInput,
  SlideIn,
  useToastError,
  useToastSuccess,
} from '@/components';
import { useDarkMode } from '@/hooks/useDarkMode';

export const PageResetPasswordConfirm = () => {
  const { t } = useTranslation();
  const { colorModeValue } = useDarkMode();
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
        title: t('account:resetPassword.feedbacks.confirmError.title'),
        description: title,
      });
    },
    onSuccess: () => {
      toastSuccess({
        title: t('account:resetPassword.feedbacks.confirmSuccess.title'),
        description: t(
          'account:resetPassword.feedbacks.confirmSuccess.description'
        ),
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
    <SlideIn>
      <Box p="2" pb="4rem" w="22rem" maxW="full" m="auto">
        <Box
          p="6"
          bg={colorModeValue('white', 'blackAlpha.400')}
          borderRadius="md"
          boxShadow="md"
        >
          <Heading size="lg" mb="4">
            {t('account:resetPassword.title')}
          </Heading>
          <Formiz
            id="reset-password-finish-form"
            onValidSubmit={submitResetPasswordFinish}
            connect={resetPasswordFinishForm}
          >
            <form noValidate onSubmit={resetPasswordFinishForm.submit}>
              <Stack spacing="4">
                <FieldInput
                  name="password"
                  type="password"
                  label={t('account:data.newPassword.label')}
                  required={t('account:data.newPassword.required') as string}
                  validations={passwordValidations}
                />
                <FieldInput
                  name="confirmPassword"
                  type="password"
                  label={t('account:data.confirmNewPassword.label')}
                  required={
                    t('account:data.confirmNewPassword.required') as string
                  }
                  validations={[
                    ...passwordValidations,
                    {
                      rule: (value) =>
                        value === resetPasswordFinishForm?.values?.password,
                      message: t('account:data.confirmNewPassword.notEqual'),
                      deps: [resetPasswordFinishForm?.values?.password],
                    },
                  ]}
                />
                <Flex>
                  <Button
                    type="submit"
                    variant="@primary"
                    ms="auto"
                    isLoading={resetPasswordLoading}
                  >
                    {t('account:resetPassword.actions.reset')}
                  </Button>
                </Flex>
              </Stack>
            </form>
          </Formiz>
        </Box>
      </Box>
    </SlideIn>
  );
};
