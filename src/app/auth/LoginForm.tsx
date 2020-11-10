import React from 'react';
import { Formiz, useForm } from '@formiz/core';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  Stack,
} from '@chakra-ui/core';
import { useLogin } from '@/app/auth/service';
import { FieldInput, useToastError } from '@/components';

export const LoginForm = ({ onSuccess = () => {}, ...rest }) => {
  const form = useForm({ subscribe: 'form' });
  const toastError = useToastError();

  const [login, { isLoading, isError }] = useLogin({
    onSuccess,
    onError: (error: any) => {
      toastError({
        title: 'Login failed',
        description: error?.response?.data?.title,
      });
    },
  });

  return (
    <Box {...rest}>
      <Formiz id="login-form" autoForm onValidSubmit={login} connect={form}>
        <Stack spacing="4">
          <FieldInput
            name="username"
            label="Username"
            required="Username is required"
          />
          <FieldInput
            name="password"
            type="password"
            label="Password"
            required="Password is required"
          />
          <Flex>
            <Button
              as={RouterLink}
              to="/account/reset"
              size="sm"
              variant="link"
            >
              Forgot password?
            </Button>
            <Button
              isLoading={isLoading}
              isDisabled={form.isSubmitted && !form.isValid}
              type="submit"
              colorScheme="brand"
              ml="auto"
            >
              Submit
            </Button>
          </Flex>
        </Stack>

        {isError && (
          <Alert status="error" my="4">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Failed to sign in!</AlertTitle>
              <AlertDescription d="block" fontSize="sm" lineHeight="1.2">
                Please check your credentials and try again.
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </Formiz>
    </Box>
  );
};
