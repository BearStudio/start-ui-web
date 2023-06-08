import React from 'react';

import { Button, Card, CardBody, Flex, Heading, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { isEmail } from '@formiz/validations';
import { useTranslation } from 'react-i18next';

import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { Page, PageContent } from '@/components/Page';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { AccountNav } from '@/features/account/AccountNav';
import {
  useAccountFormQuery,
  useUpdateAccount,
} from '@/features/account/service';
import { User } from '@/features/users/schema';
import { Loader } from '@/layout/Loader';
import { AVAILABLE_LANGUAGES } from '@/lib/i18n/constants';

export default function PageProfile() {
  const { t } = useTranslation(['common', 'account']);
  const account = useAccountFormQuery();

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const updateAccount = useUpdateAccount({
    onError: (error) => {
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
    },
  });

  const generalInformationForm = useForm<User>({
    initialValues: account.data,
    onValidSubmit: (values) => {
      const newAccount = {
        ...account.data,
        ...values,
      };

      updateAccount.mutate(newAccount);
    },
  });

  return (
    <Page nav={<AccountNav />}>
      <PageContent>
        <Heading size="md" mb="4">
          {t('account:profile.title')}
        </Heading>

        <Card minH="22rem">
          {account.isLoading && <Loader />}
          {account.isSuccess && (
            <CardBody>
              <Stack spacing={4}>
                <Formiz connect={generalInformationForm}>
                  <form noValidate onSubmit={generalInformationForm.submit}>
                    <Stack spacing="6">
                      <Stack
                        direction={{ base: 'column', sm: 'row' }}
                        spacing="6"
                      >
                        <FieldInput
                          name="firstName"
                          label={t('account:data.firstname.label')}
                          required={
                            t('account:data.firstname.required') as string
                          }
                        />
                        <FieldInput
                          name="lastName"
                          label={t('account:data.lastname.label')}
                          required={
                            t('account:data.lastname.required') as string
                          }
                        />
                      </Stack>
                      <FieldInput
                        name="email"
                        label={t('account:data.email.label')}
                        required={t('account:data.email.required') as string}
                        validations={[
                          {
                            handler: isEmail(),
                            message: t('account:data.email.invalid'),
                          },
                        ]}
                      />
                      <FieldSelect
                        name="langKey"
                        label={t('account:data.language.label')}
                        options={AVAILABLE_LANGUAGES.map(({ key }) => ({
                          label: t(`common:languages.${key}`),
                          value: key,
                        }))}
                      />
                      <Flex>
                        <Button
                          type="submit"
                          variant="@primary"
                          ms="auto"
                          isLoading={updateAccount.isLoading}
                        >
                          {t('account:profile.actions.save')}
                        </Button>
                      </Flex>
                    </Stack>
                  </form>
                </Formiz>
              </Stack>
            </CardBody>
          )}
        </Card>
      </PageContent>
    </Page>
  );
}
