import React from 'react';
import { Formiz, useForm } from '@formiz/core';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  Stack,
  useToast,
} from '@chakra-ui/core';
import { useLogin } from '@/app/auth/service';
import { useRedirectFromUrl } from '@/app/router';
import { FieldInput } from '@/components';

export const LoginPage = () => {
  const form = useForm({ subscribe: 'form' });
  const toast = useToast();
  const redirect = useRedirectFromUrl();

  const [login, { isLoading, isError }] = useLogin({
    onSuccess: () => {
      toast({
        title: 'Login success',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      redirect();
    },
    onError: () => {
      toast({
        title: 'Login failed',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  return (
    <Box p="4" maxW="20rem" m="auto">
      <Formiz autoForm onValidSubmit={login} connect={form}>
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
