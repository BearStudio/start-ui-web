import React from 'react';

import { Box, Button, Heading, Spinner, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { isEmail, isRequired } from '@formiz/validations';

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

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const { mutate: updateAccount, isLoading: updateLoading } = useUpdateAccount({
    onError: (error: any) => {
      const { title } = error?.response?.data || {};
      toastError({
        title: 'Change not applied',
        description: title,
      });
    },
    onSuccess: () => {
      toastSuccess({
        title: 'Change applied',
      });
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
            onValidSubmit={submitGeneralInformation}
            connect={generalInformationForm}
            initialValues={account}
          >
            <form
              noValidate
              onSubmit={generalInformationForm.submit}
              className="demo-form"
              style={{ minHeight: '16rem' }}
            >
              <Stack
                direction="column"
                bg="white"
                p="6"
                m="2"
                borderRadius="lg"
                spacing="20px"
                shadow="md"
              >
                <Heading size="md">General Informations</Heading>
                <Stack direction={['column', 'row']} spacing="20px">
                  <FieldInput
                    name="firstName"
                    label="First Name"
                    isRequired
                    validations={[
                      {
                        rule: isRequired(),
                        message: 'This field is required',
                      },
                    ]}
                  />
                  <FieldInput
                    name="lastName"
                    label="Last Name"
                    isRequired
                    validations={[
                      {
                        rule: isRequired(),
                        message: 'This field is required',
                      },
                    ]}
                  />
                </Stack>
                <Box>
                  <FieldInput
                    name="email"
                    label="Email"
                    isRequired
                    validations={[
                      {
                        rule: isRequired(),
                        message: 'This field is required',
                      },
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
                  <Button type="submit" colorScheme="brand" ml="auto">
                    {updateLoading ? <Spinner /> : 'Save'}
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
