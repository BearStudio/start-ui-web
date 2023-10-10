import React from 'react';

import { Button, Card, CardBody, Flex, Heading, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { isEmail } from '@formiz/validations';
import { useTranslation } from 'react-i18next';

import { ErrorPage } from '@/components/ErrorPage';
import { FieldInput } from '@/components/FieldInput';
import { Page, PageContent } from '@/components/Page';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { AccountNav } from '@/features/account/AccountNav';
import { Loader } from '@/layout/Loader';
import { trpc } from '@/lib/trpc/client';

export default function PageEmail() {
  const { t } = useTranslation(['common', 'account']);
  const trpcContext = trpc.useContext();
  const account = trpc.account.get.useQuery(undefined, {
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const updateEmail = trpc.account.updateEmail.useMutation({
    onSuccess: async () => {
      await trpcContext.account.invalidate();
      toastSuccess({
        title: t('account:email.feedbacks.updateSuccess.title'),
      });
    },
    onError: () => {
      toastError({
        title: t('account:email.feedbacks.updateError.title'),
      });
    },
  });

  const profileForm = useForm<{
    email: string;
  }>({
    initialValues: {
      email: account.data?.email ?? undefined,
    },
    onValidSubmit: (values) => {
      updateEmail.mutate(values);
    },
  });

  return (
    <Page nav={<AccountNav />}>
      <PageContent>
        <Heading size="md" mb="4">
          {t('account:email.title')}
        </Heading>

        <Card minH="11rem">
          {account.isLoading && <Loader />}
          {account.isError && <ErrorPage />}
          {account.isSuccess && (
            <CardBody>
              <Stack spacing={4}>
                <Formiz connect={profileForm}>
                  <form noValidate onSubmit={profileForm.submit}>
                    <Stack spacing="6">
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
                      <Flex>
                        <Button
                          type="submit"
                          variant="@primary"
                          ms="auto"
                          isLoading={updateEmail.isLoading}
                        >
                          {t('account:email.actions.update')}
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
