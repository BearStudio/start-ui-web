import React from 'react';

import { Box, Button, Heading, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { isEmail } from '@formiz/validations';
import { useQueryClient } from 'react-query';

import { useAccount, useUpdateAccount } from '@/app/account/service';
import { Page, PageBody, PageHeader } from '@/app/layout';
import {
  FieldInput,
  FieldSelect,
  useToastSuccess,
  useToastError,
} from '@/components';

export const PageAccount = () => {
  const { account } = useAccount();
  const generalInformationForm = useForm();
  const queryClient = useQueryClient();

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const { mutate: updateAccount, isLoading: updateLoading } = useUpdateAccount({
    onError: (error: any) => {
      const { description } = error?.response?.data || {};
      toastError({
        title: 'Update failed',
        description,
      });
    },
    onSuccess: () => {
      toastSuccess({
        title: 'Updated with success',
      });
      queryClient.invalidateQueries('account');
    },
  });

  const languages = [{ label: 'English', value: 'en' }];

  const submitGeneralInformation = async (values) => {
    const newAccount = {
      ...account,
      ...values,
    };

    await updateAccount(newAccount);
  };

  return (
    <Page>
      <PageHeader>
        <Heading size="md">Account</Heading>
      </PageHeader>
      <PageBody>
        {account && (
          <Formiz
            id="account-form"
            onValidSubmit={submitGeneralInformation}
            connect={generalInformationForm}
            initialValues={account}
          >
            <form noValidate onSubmit={generalInformationForm.submit}>
              <Stack
                direction="column"
                bg="white"
                p="6"
                borderRadius="lg"
                spacing="8"
                shadow="md"
              >
                <Stack direction={{ base: 'column', sm: 'row' }} spacing="8">
                  <FieldInput
                    name="firstName"
                    label="First Name"
                    required="This field is required"
                  />
                  <FieldInput
                    name="lastName"
                    label="Last Name"
                    required="This field is required"
                  />
                </Stack>
                <Box>
                  <FieldInput
                    name="email"
                    label="Email"
                    required="This field is required"
                    validations={[
                      { rule: isEmail(), message: 'Invalid email address' },
                    ]}
                  />
                </Box>
                <Box>
                  <FieldSelect
                    name="langKey"
                    label="Language"
                    options={languages}
                  />
                </Box>
                <Box align="right">
                  <Button
                    type="submit"
                    colorScheme="brand"
                    ml="auto"
                    isLoading={updateLoading}
                  >
                    Save
                  </Button>
                </Box>
              </Stack>
            </form>
          </Formiz>
        )}
      </PageBody>
    </Page>
  );
};
