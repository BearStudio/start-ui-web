import React from 'react';
import { Formiz, useForm } from '@formiz/core';
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Stack,
  useToast,
} from '@chakra-ui/core';
import { useCreateAccount } from '@/app/account/service';
import { FieldInput } from '@/components';
import {
  isEmail,
  isMaxLength,
  isMinLength,
  isPattern,
} from '@formiz/validations';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export const PageRegister = () => {
  const form = useForm();
  const toast = useToast();
  const navigate = useNavigate();

  const [createUser, { isLoading }] = useCreateAccount({
    onSuccess: () => {
      toast({
        title: 'Registration success',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
    },
    onError: () => {
      toast({
        title: 'Registration failed',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  return (
    <Box p="4" maxW="20rem" m="auto">
      <Formiz autoForm onValidSubmit={createUser} connect={form} id="register">
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
