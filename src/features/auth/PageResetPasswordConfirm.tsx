import React from 'react';

import { Box, Button, Flex, Heading, Stack } from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { FieldInput } from '@/components/FieldInput';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { trpc } from '@/lib/trpc/client';

export default function PageResetPasswordConfirm() {
  const { t } = useTranslation(['auth']);

  const searchParams = useSearchParams();

  const router = useRouter();

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const resetPasswordFinish = trpc.auth.resetPasswordConfirm.useMutation({
    onSuccess: () => {
      toastSuccess({
        title: t('auth:resetPassword.feedbacks.resetSuccess.title'),
        description: t('auth:resetPassword.feedbacks.resetSuccess.description'),
      });
      router.replace('/login');
    },
    onError: () => {
      toastError({
        title: t('auth:resetPassword.feedbacks.resetError.title'),
      });
    },
  });
  const resetPasswordFinishForm = useForm<{ password: string }>({
    onValidSubmit: (values) => {
      resetPasswordFinish.mutate({
        token: searchParams?.get('token') ?? 'KEY_NOT_DEFINED',
        newPassword: values.password,
      });
    },
  });
  const values = useFormFields({
    connect: resetPasswordFinishForm,
    fields: ['password'] as const,
    selector: (field) => field.value,
  });

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
            {t('auth:resetPassword.title')}
          </Heading>
          <Formiz connect={resetPasswordFinishForm}>
            <form noValidate onSubmit={resetPasswordFinishForm.submit}>
              <Stack spacing="4">
                <FieldInput
                  name="password"
                  type="password"
                  label={t('auth:data.newPassword.label')}
                  required={t('auth:data.newPassword.required')}
                />
                <FieldInput
                  name="confirmPassword"
                  type="password"
                  label={t('auth:data.confirmNewPassword.label')}
                  required={t('auth:data.confirmNewPassword.required')}
                  validations={[
                    {
                      handler: (value) => value === values?.password,
                      message: t('auth:data.confirmNewPassword.notEqual'),
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
                    {t('auth:resetPassword.actions.reset')}
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
