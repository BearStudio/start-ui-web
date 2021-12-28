import React, { useState } from 'react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  ScaleFade,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { isEmail } from '@formiz/validations';
import { Trans, useTranslation } from 'react-i18next';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';

import { useResetPasswordInit } from '@/app/account/account.service';
import { FieldInput, SlideIn, useToastError } from '@/components';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useRtl } from '@/hooks/useRtl';

export const PageResetPasswordRequest = () => {
  const { rtlValue } = useRtl();
  const { t } = useTranslation();
  const { colorModeValue } = useDarkMode();
  const resetPasswordInitForm = useForm();

  const toastError = useToastError();

  const [accountEmail, setAccountEmail] = useState('');

  const {
    mutate: resetPasswordInit,
    isLoading: resetPasswordLoading,
    isSuccess: resetPasswordSuccess,
  } = useResetPasswordInit({
    onMutate: () => {
      setAccountEmail(resetPasswordInitForm.values?.email);
    },
    onError: (error: any) => {
      const { title } = error?.response?.data || {};
      toastError({
        title: t('account:resetPassword.feedbacks.initError.title'),
        description: title,
      });
    },
  });

  const submitResetPasswordInit = async (values) => {
    await resetPasswordInit(values.email);
  };

  if (resetPasswordSuccess) {
    return (
      <Center p="4" m="auto">
        <ScaleFade initialScale={0.9} in>
          <Alert
            status="success"
            variant="solid"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            borderRadius="lg"
            px="8"
            py="4"
            maxW="xl"
          >
            <Box fontSize="3rem">✉️</Box>
            <AlertTitle mt={4} mb={1} fontSize="lg">
              {t('account:resetPassword.feedbacks.initSuccess.title')}
            </AlertTitle>
            <AlertDescription>
              <Trans
                t={t}
                i18nKey="account:resetPassword.feedbacks.initSuccess.description"
                values={{ email: accountEmail }}
              />
            </AlertDescription>
          </Alert>
          <Center mt="8">
            <Button
              as={RouterLink}
              to="/login"
              variant="link"
              color={colorModeValue('brand.500', 'brand.300')}
            >
              {t('account:resetPassword.actions.goToLogin')}
            </Button>
          </Center>
        </ScaleFade>
      </Center>
    );
  }

  return (
    <SlideIn>
      <Box p="2" pb="4rem" w="22rem" maxW="full" m="auto">
        <Box
          p="6"
          bg={colorModeValue('white', 'blackAlpha.400')}
          borderRadius="md"
          boxShadow="md"
        >
          <Heading size="lg">{t('account:resetPassword.title')}</Heading>
          <Formiz
            id="reset-password-init-form"
            onValidSubmit={submitResetPasswordInit}
            connect={resetPasswordInitForm}
          >
            <form noValidate onSubmit={resetPasswordInitForm.submit}>
              <FieldInput
                name="email"
                label={t('account:data.email.label')}
                my="6"
                helper={t('account:data.email.resetHelper')}
                required={t('account:data.email.required') as string}
                validations={[
                  {
                    rule: isEmail(),
                    message: t('account:data.email.invalid'),
                  },
                ]}
              />
              <Flex>
                <Button
                  leftIcon={rtlValue(<FiArrowLeft />, <FiArrowRight />)}
                  as={RouterLink}
                  to="/login"
                  variant="link"
                >
                  {t('account:resetPassword.actions.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="@primary"
                  ms="auto"
                  isLoading={resetPasswordLoading}
                >
                  {t('account:resetPassword.actions.send')}
                </Button>
              </Flex>
            </form>
          </Formiz>
        </Box>
      </Box>
    </SlideIn>
  );
};
