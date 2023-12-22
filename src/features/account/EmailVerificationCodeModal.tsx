import React from 'react';

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useToastSuccess } from '@/components/Toast';
import {
  VerificationCodeForm,
  useOnVerificationCodeError,
} from '@/features/auth/VerificationCodeForm';
import { useSearchParamsUpdater } from '@/hooks/useSearchParamsUpdater';
import { trpc } from '@/lib/trpc/client';

export const SEARCH_PARAM_VERIFY_EMAIL = 'verify-email';

export const EmailVerificationCodeModale = () => {
  const { t } = useTranslation(['account']);
  const searchParams = useSearchParams();
  const searchParamsUpdater = useSearchParamsUpdater();
  const verifyEmail = searchParams.get(SEARCH_PARAM_VERIFY_EMAIL);
  const token = searchParams.get('token');
  const trpcUtils = trpc.useUtils();
  const toastSuccess = useToastSuccess();

  const onClose = () => {
    trpcUtils.account.get.reset();
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
