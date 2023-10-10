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
  Text,
} from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import { isEmail } from '@formiz/validations';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LuCheckCircle2 } from 'react-icons/lu';

import { ErrorPage } from '@/components/ErrorPage';
import { FieldInput } from '@/components/FieldInput';
import { Page, PageContent } from '@/components/Page';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { AccountNav } from '@/features/account/AccountNav';
import {
  VerificationCodeForm,
  useOnVerificationCodeError,
} from '@/features/auth/VerificationCodeForm';
import { useSearchParamsUpdater } from '@/hooks/useSearchParamsUpdater';
import { Loader } from '@/layout/Loader';
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
    onSuccess: async (_, { email }) => {
      searchParamsUpdater(
        { [SEARCH_PARAM_VERIFY_EMAIL]: email },
        { replace: true }
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
            {account.isLoading && <Loader />}
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
                              {/* TODO translations */}
                              This is your current email
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
  const searchParams = useSearchParams();
  const searchParamsUpdater = useSearchParamsUpdater();
  const verifyEmail = searchParams.get(SEARCH_PARAM_VERIFY_EMAIL);
  const trpcContext = trpc.useContext();
  const toastSuccess = useToastSuccess();

  const onClose = () => {
    searchParamsUpdater(
      {
        [SEARCH_PARAM_VERIFY_EMAIL]: null,
        attempts: null,
      },
      { replace: true }
    );
  };

  const form = useForm<{ code: string }>({
    onValidSubmit: () => {
      // TODO
      updateEmailValidate.mutate(undefined);
    },
  });
  const onVerificationCodeError = useOnVerificationCodeError({ form });
  const updateEmailValidate = trpc.account.updateEmailValidate.useMutation({
    onSuccess: async () => {
      await trpcContext.account.get.reset();
      onClose();
      toastSuccess({
        title: 'Email updated', // TODO translations
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
