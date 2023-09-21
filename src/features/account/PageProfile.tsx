import React from 'react';

import { Button, Card, CardBody, Flex, Heading, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { isEmail } from '@formiz/validations';
import { useTranslation } from 'react-i18next';

import { ErrorPage } from '@/components/ErrorPage';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { Page, PageContent } from '@/components/Page';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { AccountNav } from '@/features/account/AccountNav';
import { Loader } from '@/layout/Loader';
import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE_KEY,
} from '@/lib/i18n/constants';
import { trpc } from '@/lib/trpc/client';

export default function PageProfile() {
  const { t } = useTranslation(['common', 'account']);
  const trpcContext = trpc.useContext();
  const account = trpc.account.get.useQuery(undefined, {
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const updateAccount = trpc.account.update.useMutation({
    onSuccess: async () => {
      await trpcContext.account.invalidate();
      toastSuccess({
        title: t('account:profile.feedbacks.updateSuccess.title'),
      });
    },
    onError: (error) => {
      if (error.data?.code === 'CONFLICT') {
        profileForm.setErrors({
          email: t('account:data.email.alreadyUsed'),
        });
        return;
      }
      toastError({
        title: t('account:profile.feedbacks.updateError.title'),
      });
    },
  });

  const profileForm = useForm<{
    name: string;
    email: string;
    language: string;
  }>({
    initialValues: {
      name: account.data?.name ?? undefined,
      email: account.data?.email ?? undefined,
      language: account.data?.language ?? undefined,
    },
    onValidSubmit: (values) => {
      updateAccount.mutate(values);
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
          {account.isError && <ErrorPage />}
          {account.isSuccess && (
            <CardBody>
              <Stack spacing={4}>
                <Formiz connect={profileForm}>
                  <form noValidate onSubmit={profileForm.submit}>
                    <Stack spacing="6">
                      <FieldInput
                        name="name"
                        label={t('account:data.name.label')}
                        required={t('account:data.name.required')}
                      />
                      <FieldInput
                        name="email"
                        label={t('account:data.email.label')}
                        required={t('account:data.email.required')}
                        validations={[
                          {
                            handler: isEmail(),
                            message: t('account:data.email.invalid'),
                          },
                        ]}
                      />
                      <FieldSelect
                        name="language"
                        label={t('account:data.language.label')}
                        options={AVAILABLE_LANGUAGES.map(({ key }) => ({
                          label: t(`common:languages.${key}`),
                          value: key,
                        }))}
                        defaultValue={DEFAULT_LANGUAGE_KEY}
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
