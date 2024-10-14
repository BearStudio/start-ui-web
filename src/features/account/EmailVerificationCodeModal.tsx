import React from 'react';

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Form } from '@/components/Form';
import { toastCustom } from '@/components/Toast';
import {
  VerificationCodeForm,
  useOnVerificationCodeError,
} from '@/features/auth/VerificationCodeForm';
import {
  FormFieldsVerificationCode,
  zFormFieldsVerificationCode,
} from '@/features/auth/schemas';
import { trpc } from '@/lib/trpc/client';

export const EmailVerificationCodeModale = () => {
  const { t } = useTranslation(['account']);
  const [searchParams, setSearchParams] = useQueryStates({
    verifyEmail: parseAsString,
    token: parseAsString,
    attempts: parseAsInteger.withDefault(0),
  });
  const trpcUtils = trpc.useUtils();

  const onClose = () => {
    trpcUtils.account.get.reset();
    setSearchParams({
      verifyEmail: null,
      token: null,
      attempts: null,
    });
  };

  const form = useForm<FormFieldsVerificationCode>({
    mode: 'onBlur',
    resolver: zodResolver(zFormFieldsVerificationCode()),
    defaultValues: {
      code: '',
    },
  });
  const onVerificationCodeError = useOnVerificationCodeError({
    onError: (error) => form.setError('code', { message: error }),
  });
  const updateEmailValidate = trpc.account.updateEmailValidate.useMutation({
    onSuccess: async () => {
      onClose();
      toastCustom({
        status: 'success',
        title: t('account:email.feedbacks.updateSuccess.title'),
      });
    },
    onError: onVerificationCodeError,
  });

  const onSubmit: SubmitHandler<FormFieldsVerificationCode> = (values) => {
    updateEmailValidate.mutate({ ...values, token: searchParams.token ?? '' });
  };

  return (
    <Modal size="sm" isOpen onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody>
          <Form {...form} onSubmit={onSubmit}>
            <VerificationCodeForm
              email={searchParams.verifyEmail ?? ''}
              isLoading={
                updateEmailValidate.isLoading || updateEmailValidate.isSuccess
              }
            />
          </Form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
