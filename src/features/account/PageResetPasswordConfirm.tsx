import React from 'react';

import { Box, Button, Flex, Heading, Stack } from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import { isMaxLength, isMinLength } from '@formiz/validations';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { FieldInput } from '@/components/FieldInput';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { useResetPasswordFinish } from '@/features/account/api.client';

export default function PageResetPasswordConfirm() {
  const { t } = useTranslation(['account']);

  const searchParams = useSearchParams();

  const router = useRouter();

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const resetPasswordFinish = useResetPasswordFinish({
    onError: (error) => {
      toastError({
        title: t('account:resetPassword.feedbacks.resetError.title'),
        description: error.status === 400 ? error?.body.title : '',
      });
    },
    onSuccess: () => {
      toastSuccess({
        title: t('account:resetPassword.feedbacks.resetSuccess.title'),
        description: t(
          'account:resetPassword.feedbacks.resetSuccess.description'
        ),
      });
      router.replace('/login');
    },
  });
  const resetPasswordFinishForm = useForm<{ password: string }>({
    id: 'reset-password-finish-form',
    onValidSubmit: (values) => {
      resetPasswordFinish.mutate({
        body: {
          key: searchParams?.get('key') ?? 'KEY_NOT_DEFINED',
          newPassword: values.password,
        },
      });
    },
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
                  required={t('account:data.newPassword.required')}
                  validations={passwordValidations}
                />
                <FieldInput
                  name="confirmPassword"
                  type="password"
                  label={t('account:data.confirmNewPassword.label')}
                  required={t('account:data.confirmNewPassword.required')}
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
