import React, { useEffect } from 'react';
import { Formiz, useForm } from '@formiz/core';
import {
  Box,
  Button,
  Flex,
  Stack,
  useToast,
} from '@chakra-ui/core';
import { useAuthContext } from '@/app/auth/AuthContext';
import { useCreateAccount } from '@/app/account/service';
import { useRedirectFromUrl } from '@/app/router';
import { FieldInput } from '@/components';
import { isEmail } from '@formiz/validations';

export const RegisterPage = () => {
  const { isLogged } = useAuthContext();
  const form = useForm({ subscribe: 'form' });
  const toast = useToast();
  const redirect = useRedirectFromUrl();

  const [createUser, { isLoading }] = useCreateAccount({
    onSuccess: () => {
      toast({
        title: 'Register success',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      redirect();
    },
    onError: () => {
      toast({
        title: 'Register failed',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  useEffect(() => {
    if (isLogged) {
      redirect();
    }
  }, [isLogged, redirect]);

  return (
    <Box p="4" maxW="20rem" m="auto">
      <Formiz autoForm onValidSubmit={createUser} connect={form}>
        <Stack spacing="4">
          <FieldInput
            name="login"
            label="Username"
            required="Username is required"
          />
          <FieldInput
            name="email"
            label="Email"
            validations={[
              {
                rule: isEmail(),
                message: 'Invalid email',
              }
            ]}
            required="Email is required"
          />
          <FieldInput
            name="password"
            type="password"
            label="Password"
            required="Password is required"
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
      </Formiz>
    </Box>
  );
};
