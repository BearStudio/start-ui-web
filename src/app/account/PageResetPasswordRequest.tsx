import React from 'react';

import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  ScaleFade,
  Stack,
} from '@chakra-ui/react';
import { Formiz } from '@formiz/core';
import { isRequired } from '@formiz/validations';
import { FiArrowLeft } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';

import { FieldInput } from '@/components';

export const PageResetPasswordRequest = () => {
  return (
    <Center p="4" m="auto">
      <ScaleFade initialScale={0.9} in>
        <Box>
          <Heading size="lg">Reset password</Heading>
          <Formiz>
            <FieldInput
              name="email"
              label="Email"
              isRequired
              my="6"
              helper="Enter the email address you used to register"
              validations={[
                {
                  rule: isRequired(),
                  message: 'Email is required',
                },
              ]}
            />
            <Flex>
              <Stack direction="row" spacing={4}>
                <Button
                  leftIcon={<FiArrowLeft />}
                  as={RouterLink}
                  to="/login"
                  variant="ghost"
                >
                  Back
                </Button>
              </Stack>
              <Button type="submit" colorScheme="brand" ml="auto">
                Send a email
              </Button>
            </Flex>
          </Formiz>
        </Box>
      </ScaleFade>
    </Center>
  );
};
