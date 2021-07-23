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
import { FiArrowLeft } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';

import { useResetPasswordInit } from '@/app/account/account.service';
import { FieldInput, SlideIn, useToastError } from '@/components';
import { useDarkMode } from '@/hooks/useDarkMode';

export const PageResetPasswordRequest = () => {
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
        title: 'Reset password failed',
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
          >
            <Box fontSize="3rem">✉️</Box>
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Reset password email sent with success!
            </AlertTitle>
            <AlertDescription>
              If an account exist with email <strong>{accountEmail}</strong>,
              you should have received an email.
            </AlertDescription>
          </Alert>
          <Center mt="8">
            <Button
              as={RouterLink}
              to="/login"
              variant="link"
              color={colorModeValue('brand.500', 'brand.300')}
            >
              Go to Login
            </Button>
          </Center>
        </ScaleFade>
      </Center>
    );
  }

  return (
    <SlideIn>
      <Box p="2" pb="4rem" w="20rem" maxW="full" m="auto">
        <Box
          p="6"
          bg={colorModeValue('white', 'blackAlpha.400')}
          borderRadius="md"
          boxShadow="md"
        >
          <Heading size="lg">Reset password</Heading>
          <Formiz
            id="reset-password-init-form"
            onValidSubmit={submitResetPasswordInit}
            connect={resetPasswordInitForm}
          >
            <form noValidate onSubmit={resetPasswordInitForm.submit}>
              <FieldInput
                name="email"
                label="Email"
                my="6"
                helper="Enter the email address you used to register"
                required="Email is required"
                validations={[
                  {
                    rule: isEmail(),
                    message: 'Email is invalid',
                  },
                ]}
              />
              <Flex>
                <Button
                  leftIcon={<FiArrowLeft />}
                  as={RouterLink}
                  to="/login"
                  variant="link"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="@primary"
                  ml="auto"
                  isLoading={resetPasswordLoading}
                >
                  Send email
                </Button>
              </Flex>
            </form>
          </Formiz>
        </Box>
      </Box>
    </SlideIn>
  );
};
