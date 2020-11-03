import React from 'react';
import { Formiz, useForm } from '@formiz/core';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Stack,
  useToast,
} from '@chakra-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { useLogin } from '@/app/auth/service';
import { useRedirectFromUrl } from '@/app/router';
import { FieldInput } from '@/components';

export const LoginPage = () => {
  const form = useForm({ subscribe: 'form' });
  const toast = useToast();
  const redirect = useRedirectFromUrl();

  const [login, { isLoading, isError }] = useLogin({
    onSuccess: () => {
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
        <Heading my="4">Login</Heading>
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

        <Center mt="8">
          <Button as={RouterLink} to="/account/register" variant="link">
            Need an account?{' '}
            <Box as="strong" color="brand.500" ml="2">
              Register now!
            </Box>
          </Button>
        </Center>
      </Formiz>
    </Box>
  );
};
