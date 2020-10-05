import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Formiz, useForm } from '@formiz/core';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  useToast,
} from '@chakra-ui/core';
import { useAuthContext } from '@/app/auth/AuthContext';
import { useLogin } from '@/app/auth/service';
import { FieldInput } from '@/components';

export const LoginPage = () => {
  const form = useForm({ subscribe: 'form' });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams()
  const toast = useToast();
  const { isLogged } = useAuthContext();

  const [login, { isLoading, isError }] = useLogin({
    onSuccess: () => {
      toast({
        title: 'Login success',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate(searchParams.get('redirect') ?? '/');
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

  useEffect(() => {
    if (isLogged) {
      navigate('/');
    }
  }, [isLogged, navigate]);

  return (
    <Box p="4" maxW="20rem" m="auto">
      <Formiz autoForm onValidSubmit={login} connect={form}>
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
