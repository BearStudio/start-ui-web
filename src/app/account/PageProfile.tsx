import React from 'react';

import { Flex, Button, Heading, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { isEmail } from '@formiz/validations';
import { useQueryClient } from 'react-query';

import { AccountNav } from '@/app/account/AccountNav';
import { useAccount, useUpdateAccount } from '@/app/account/account.service';
import { Page, PageContent } from '@/app/layout';
import {
  FieldInput,
  FieldSelect,
  useToastSuccess,
  useToastError,
} from '@/components';
import { useDarkMode } from '@/hooks/useDarkMode';

export const PageProfile = () => {
  const { colorModeValue } = useDarkMode();
  const { account } = useAccount();
  const generalInformationForm = useForm();
  const queryClient = useQueryClient();

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const { mutate: updateAccount, isLoading: updateLoading } = useUpdateAccount({
    onError: (error: any) => {
      const { title } = error?.response?.data || {};
      toastError({
        title: 'Update failed',
        description: title,
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
    <Page nav={<AccountNav />}>
      <PageContent>
        <Heading size="md" mb="4">
          Profile
        </Heading>
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
                bg={colorModeValue('white', 'blackAlpha.400')}
                p="6"
                borderRadius="lg"
                spacing="6"
                shadow="md"
              >
                <Stack direction={{ base: 'column', sm: 'row' }} spacing="6">
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
                <FieldInput
                  name="email"
                  label="Email"
                  required="This field is required"
                  validations={[
                    { rule: isEmail(), message: 'Invalid email address' },
                  ]}
                />
                <FieldSelect
                  name="langKey"
                  label="Language"
                  options={languages}
                />
                <Flex>
                  <Button
                    type="submit"
                    variant="@primary"
                    ml="auto"
                    isLoading={updateLoading}
                  >
                    Save
                  </Button>
                </Flex>
              </Stack>
            </form>
          </Formiz>
        )}
      </PageContent>
    </Page>
  );
};
