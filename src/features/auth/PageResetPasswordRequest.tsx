import React, { useState } from 'react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Flex,
  Heading,
  ScaleFade,
  Stack,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { isEmail } from '@formiz/validations';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu';

import { FieldInput } from '@/components/FieldInput';
import { SlideIn } from '@/components/SlideIn';
import { useToastError } from '@/components/Toast';
import { useRtl } from '@/hooks/useRtl';
import { trpc } from '@/lib/trpc/client';

export default function PageResetPasswordRequest() {
  const { rtlValue } = useRtl();
  const { t } = useTranslation(['auth']);

  const toastError = useToastError();

  const [accountEmail, setAccountEmail] = useState('');

  const resetPasswordRequest = trpc.auth.resetPasswordRequest.useMutation({
    onMutate: ({ email }) => {
      setAccountEmail(email);
    },
    onError: () => {
      toastError({
        title: t('auth:resetPassword.feedbacks.initError.title'),
      });
    },
  });

  const resetPasswordRequestForm = useForm<{ email: string }>({
    onValidSubmit: (values) => {
      resetPasswordRequest.mutate({ email: values.email });
    },
  });

  if (resetPasswordRequest.isSuccess) {
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
              {t('auth:resetPassword.feedbacks.initSuccess.title')}
            </AlertTitle>
            <AlertDescription>
              <Trans
                t={t}
                i18nKey="auth:resetPassword.feedbacks.initSuccess.description"
                values={{ email: accountEmail }}
              />
            </AlertDescription>
          </Alert>
          <Center mt="8">
            <Button
              as={Link}
              href="/login"
              variant="link"
              color="brand.500"
              _dark={{ color: 'brand.300' }}
            >
              {t('auth:resetPassword.actions.goToLogin')}
            </Button>
          </Center>
        </ScaleFade>
      </Center>
    );
  }

  return (
    <SlideIn>
      <Box p="2" pb="4rem" w="22rem" maxW="full" m="auto">
        <Card>
          <CardHeader pb={0}>
            <Heading size="md">{t('auth:resetPassword.title')}</Heading>
          </CardHeader>
          <CardBody>
            <Formiz connect={resetPasswordRequestForm}>
              <form noValidate onSubmit={resetPasswordRequestForm.submit}>
                <Stack spacing={4}>
                  <FieldInput
                    name="email"
                    label={t('auth:data.email.label')}
                    helper={t('auth:data.email.resetHelper')}
                    required={t('auth:data.email.required')}
                    validations={[
                      {
                        handler: isEmail(),
                        message: t('auth:data.email.invalid'),
                      },
                    ]}
                  />
                  <Flex>
                    <Button
                      leftIcon={rtlValue(<LuArrowLeft />, <LuArrowRight />)}
                      as={Link}
                      href="/login"
                      variant="link"
                    >
                      {t('auth:resetPassword.actions.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      variant="@primary"
                      ms="auto"
                      isLoading={resetPasswordRequest.isLoading}
                    >
                      {t('auth:resetPassword.actions.send')}
                    </Button>
                  </Flex>
                </Stack>
              </form>
            </Formiz>
          </CardBody>
        </Card>
      </Box>
    </SlideIn>
  );
}
