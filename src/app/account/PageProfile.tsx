import React from 'react';

import { Flex, Button, Heading, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { isEmail } from '@formiz/validations';
import { useTranslation } from 'react-i18next';
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
import { AVAILABLE_LANGUAGES } from '@/constants/i18n';
import { useDarkMode } from '@/hooks/useDarkMode';

export const PageProfile = () => {
  const { t } = useTranslation();
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
        title: t('account:profile.feedbacks.updateError.title'),
        description: title,
      });
    },
    onSuccess: () => {
      toastSuccess({
        title: t('account:profile.feedbacks.updateSuccess.title'),
      });
      queryClient.invalidateQueries('account');
    },
  });

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
          {t('account:profile.title')}
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
                    label={t('account:data.firstname.label')}
                    required={t('account:data.firstname.required') as string}
                  />
                  <FieldInput
                    name="lastName"
                    label={t('account:data.lastname.label')}
                    required={t('account:data.lastname.required') as string}
                  />
                </Stack>
                <FieldInput
                  name="email"
                  label={t('account:data.email.label')}
                  required={t('account:data.email.required') as string}
                  validations={[
                    {
                      rule: isEmail(),
                      message: t('account:data.email.invalid'),
                    },
                  ]}
                />
                <FieldSelect
                  name="langKey"
                  label={t('account:data.language.label')}
                  options={AVAILABLE_LANGUAGES.map((langKey) => ({
                    label: t(`languages.${langKey}`),
                    value: langKey,
                  }))}
                />
                <Flex>
                  <Button
                    type="submit"
                    variant="@primary"
                    ms="auto"
                    isLoading={updateLoading}
                  >
                    {t('account:profile.actions.save')}
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
