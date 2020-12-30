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

import { useResetPasswordInit } from '@/app/account/service';
import { FieldInput, useToastError } from '@/components';

export const PageResetPasswordRequest = () => {
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
      const { description } = error?.response?.data || {};
      toastError({
        title: 'Reset password failed',
        description,
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
            <Button as={RouterLink} to="/login" variant="link">
              <Box as="strong" color="brand.500" ml="2">
                Go to Login
              </Box>
            </Button>
          </Center>
        </ScaleFade>
      </Center>
    );
  }

  return (
    <Center p="4" m="auto">
      <Box>
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
                colorScheme="brand"
                ml="auto"
                isLoading={resetPasswordLoading}
              >
                Send email
              </Button>
            </Flex>
          </form>
        </Formiz>
      </Box>
    </Center>
  );
};
