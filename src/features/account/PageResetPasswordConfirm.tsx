import React from 'react';

import { Box, Button, Flex, Heading, Stack } from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import { isMaxLength, isMinLength } from '@formiz/validations';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { FieldInput } from '@/components/FieldInput';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { useResetPasswordFinish } from '@/features/account/service';

export default function PageResetPasswordConfirm() {
  const { t } = useTranslation(['account']);

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const resetPasswordFinish = useResetPasswordFinish({
    onError: (error) => {
      const { title } = error?.response?.data || {};
      toastError({
        title: t('account:resetPassword.feedbacks.resetError.title'),
        description: title,
      });
    },
    onSuccess: () => {
      toastSuccess({
        title: t('account:resetPassword.feedbacks.resetSuccess.title'),
        description: t(
          'account:resetPassword.feedbacks.resetSuccess.description'
        ),
      });
      navigate('/login');
    },
  });

  const submitResetPasswordFinish = (values: TODO) => {
    resetPasswordFinish.mutate({
      key: searchParams.get('key') ?? 'KEY_NOT_DEFINED',
      newPassword: values.password,
    });
  };

  const resetPasswordFinishForm = useForm({
    id: 'reset-password-finish-form',
    onValidSubmit: submitResetPasswordFinish,
  });
  const values = useFormFields({
    connect: resetPasswordFinishForm,
    fields: ['password'] as const,
    selector: (field) => field.value,
  });

  const passwordValidations = [
    {
      handler: isMinLength(4),
      message: t('account:data.password.tooShort', { min: 4 }),
    },
    {
      handler: isMaxLength(50),
      message: t('account:data.password.tooLong', { max: 50 }),
    },
  ];

  return (
    <SlideIn>
      <Box p="2" pb="4rem" w="22rem" maxW="full" m="auto">
        <Box
          p="6"
          borderRadius="md"
          boxShadow="md"
          bg="white"
          _dark={{ bg: 'blackAlpha.400' }}
        >
          <Heading size="lg" mb="4">
            {t('account:resetPassword.title')}
          </Heading>
          <Formiz connect={resetPasswordFinishForm}>
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
                      handler: (value) => value === values?.password,
                      message: t('account:data.confirmNewPassword.notEqual'),
                      deps: [values?.password],
                    },
                  ]}
                />
                <Flex>
                  <Button
                    type="submit"
                    variant="@primary"
                    ms="auto"
                    isLoading={resetPasswordFinish.isLoading}
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
}
