import React from 'react';

import { Box, Button, Flex, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { Link as RouterLink } from 'react-router-dom';

import { useLogin } from '@/app/auth/service';
import { FieldInput, useToastError } from '@/components';

export const LoginForm = ({ onSuccess = () => {}, ...rest }) => {
  const form = useForm({ subscribe: 'form' });
  const toastError = useToastError();

  const [login, { isLoading }] = useLogin({
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
              Log In
            </Button>
          </Flex>
        </Stack>
      </Formiz>
    </Box>
  );
};
