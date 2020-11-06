import React, { useState } from 'react';
import { Formiz, useForm } from '@formiz/core';
import {
  Alert,
  AlertTitle,
  AlertDescription,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Stack,
  ScaleFade,
} from '@chakra-ui/core';
import { useCreateAccount } from '@/app/account/service';
import { FieldInput, useToastError } from '@/components';
import {
  isEmail,
  isMaxLength,
  isMinLength,
  isPattern,
} from '@formiz/validations';
import { Link as RouterLink } from 'react-router-dom';

export const PageRegister = () => {
  const form = useForm();
  const toastError = useToastError();
  const [accountEmail, setAccountEmail] = useState('');

  const [createUser, { isLoading, isSuccess }] = useCreateAccount({
    onMutate: () => {
      setAccountEmail(form.values?.email);
    },
    onError: (error: any) => {
      const { errorKey, title } = error?.response?.data || {};

      toastError({
        title: 'Registration failed',
        description: title,
      });

      if (errorKey === 'userexists') {
        form.invalidateFields({ login: 'Login already used' });
      }

      if (errorKey === 'emailexists') {
        form.invalidateFields({ email: 'Email already used' });
      }
    },
  });

  if (isSuccess) {
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
            <Box fontSize="3rem">🎉</Box>
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Account created with success!
            </AlertTitle>
            <AlertDescription>
              Please check your email <strong>{accountEmail}</strong> inbox to
              activate your account.
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
    <Box p="6" pb="4rem" w="20rem" maxW="full" m="auto">
      <Formiz
        id="register-form"
        autoForm
        onValidSubmit={createUser}
        connect={form}
      >
        <Heading my="4">Register</Heading>
        <Stack spacing="4">
          <FieldInput
            name="login"
            label="Username"
            required="Username is required"
            validations={[
              {
                rule: isMinLength(2),
                message: 'Username too short (min. 2 characters)',
              },
              {
                rule: isMaxLength(50),
                message: 'Username too long (max. 50 characters)',
              },
              {
                rule: isPattern(
                  '^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$'
                ),
                message: "Username is invalid, don't use special characters",
              },
            ]}
          />
          <FieldInput
            name="email"
            label="Email"
            required="Email is required"
            validations={[
              {
                rule: isMinLength(5),
                message: 'Email too short (min. 5 characters)',
              },
              {
                rule: isMaxLength(254),
                message: 'Email too long (max. 254 characters)',
              },
              {
                rule: isEmail(),
                message: 'Email is invalid',
              },
            ]}
          />
          <FieldInput
            name="password"
            type="password"
            label="Password"
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
          <Flex>
            <Button
              isLoading={isLoading}
              isDisabled={form.isSubmitted && !form.isValid}
              type="submit"
              colorScheme="brand"
              ml="auto"
            >
              Create Account
            </Button>
          </Flex>
        </Stack>
        <Center mt="8">
          <Button as={RouterLink} to="/login" variant="link">
            Already have an account?{' '}
            <Box as="strong" color="brand.500" ml="2">
              Login
            </Box>
          </Button>
        </Center>
      </Formiz>
    </Box>
  );
};
