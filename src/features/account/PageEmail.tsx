import React from 'react';

import {
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Stack,
} from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import { isEmail } from '@formiz/validations';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { ErrorPage } from '@/components/ErrorPage';
import { FieldInput } from '@/components/FieldInput';
import { LoaderFull } from '@/components/LoaderFull';
import { Page, PageContent } from '@/components/Page';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { AccountNav } from '@/features/account/AccountNav';
import {
  VerificationCodeForm,
  useOnVerificationCodeError,
} from '@/features/auth/VerificationCodeForm';
import { useSearchParamsUpdater } from '@/hooks/useSearchParamsUpdater';
import { trpc } from '@/lib/trpc/client';

const SEARCH_PARAM_VERIFY_EMAIL = 'verify-email';

export default function PageEmail() {
  const { t } = useTranslation(['common', 'account']);
  const searchParams = useSearchParams();
  const verifyEmail = searchParams.get(SEARCH_PARAM_VERIFY_EMAIL);
  const searchParamsUpdater = useSearchParamsUpdater();
  const account = trpc.account.get.useQuery(undefined, {
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const toastError = useToastError();

  const updateEmail = trpc.account.updateEmail.useMutation({
    onSuccess: async ({ token }, { email }) => {
      searchParamsUpdater(
        {
          [SEARCH_PARAM_VERIFY_EMAIL]: email,
          token,
        },
        {
          replace: true,
        }
      );
    },
    onError: () => {
      toastError({
        title: t('account:email.feedbacks.updateError.title'),
      });
    },
  });

  const form = useForm<{
    email: string;
  }>({
    initialValues: {
      email: account.data?.email ?? undefined,
    },
    onValidSubmit: (values) => {
      updateEmail.mutate(values);
    },
  });

  const values = useFormFields({
    connect: form,
    selector: 'value',
  });

  return (
    <>
      <Page nav={<AccountNav />}>
        <PageContent>
          <Heading size="md" mb="4">
            {t('account:email.title')}
          </Heading>

          <Card minH="11rem">
            {account.isLoading && <LoaderFull />}
            {account.isError && <ErrorPage />}
            {account.isSuccess && (
              <CardBody>
                <Stack spacing={4}>
                  <Formiz connect={form}>
                    <form noValidate onSubmit={form.submit}>
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
                        <Flex
                          justifyContent="flex-end"
                          alignItems="center"
                          gap={4}
                        >
                          {account.data.email === values.email && (
                            <Flex fontSize="sm" opacity={0.6}>
                              {t('account:data.email.current')}
                            </Flex>
                          )}
                          <Button
                            type="submit"
                            variant="@primary"
                            isDisabled={
                              (form.isSubmitted && !form.isValid) ||
                              account.data.email === values.email
                            }
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
      {!!verifyEmail && <VerificationCodeModale />}
    </>
  );
}

const VerificationCodeModale = () => {
  const { t } = useTranslation(['account']);
  const searchParams = useSearchParams();
  const searchParamsUpdater = useSearchParamsUpdater();
  const verifyEmail = searchParams.get(SEARCH_PARAM_VERIFY_EMAIL);
  const token = searchParams.get('token');
  const trpcContext = trpc.useContext();
  const toastSuccess = useToastSuccess();

  const onClose = () => {
    trpcContext.account.get.reset();
    searchParamsUpdater(
      {
        [SEARCH_PARAM_VERIFY_EMAIL]: null,
        token: null,
        attempts: null,
      },
      { replace: true }
    );
  };

  const form = useForm<{ code: string }>({
    onValidSubmit: (values) => {
      updateEmailValidate.mutate({
        code: values.code,
        token: token ?? '',
      });
    },
  });
  const onVerificationCodeError = useOnVerificationCodeError({ form });
  const updateEmailValidate = trpc.account.updateEmailValidate.useMutation({
    onSuccess: async () => {
      onClose();
      toastSuccess({
        title: t('account:email.feedbacks.updateSuccess.title'),
      });
    },
    onError: onVerificationCodeError,
  });

  return (
    <Modal size="sm" isOpen onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody>
          <Formiz connect={form} autoForm>
            <VerificationCodeForm
              email={verifyEmail ?? ''}
              isLoading={updateEmailValidate.isLoading}
            />
          </Formiz>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
