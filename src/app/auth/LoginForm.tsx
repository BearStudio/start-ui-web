import React from 'react';

import { Box, Button, Divider, Flex, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { FaFacebook } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

import { useLogin, useFacebookLogin } from '@/app/auth/service';
import { FieldInput, useToastError } from '@/components';

export const LoginForm = ({ onSuccess = () => {}, ...rest }) => {
  const form = useForm({ subscribe: 'form' });
  const toastError = useToastError();
  const {
    mutate: handleFacebookLogin,
    isLoading: facebookLoginLoading,
  } = useFacebookLogin();

  const { mutate: login, isLoading } = useLogin({
    onSuccess,
    onError: (error: any) => {
      toastError({
        title: 'Login failed',
        description: error?.response?.data?.title,
      });
    },
  });

  const loginUserFromFacebook = (response) => {
    const { email, id: facebookId, accessToken: facebookToken } = response;
    handleFacebookLogin({ email, facebookId, facebookToken });
  };

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
          <Divider />
          {process.env.NEXT_PUBLIC_FACEBOOK_APP_ID && (
            <FacebookLogin
              appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}
              fields="name,email"
              callback={loginUserFromFacebook}
              render={(props) => (
                <Button
                  leftIcon={<FaFacebook />}
                  colorScheme="blue"
                  {...props}
                  isLoading={props.isProcessing || facebookLoginLoading}
                >
                  Login with Facebook
                </Button>
              )}
            />
          )}
        </Stack>
      </Formiz>
    </Box>
  );
};
