import React from 'react';

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useToastSuccess } from '@/components/Toast';
import {
  VerificationCodeForm,
  useOnVerificationCodeError,
} from '@/features/auth/VerificationCodeForm';
import { useSearchParamsUpdater } from '@/hooks/useSearchParamsUpdater';
import { trpc } from '@/lib/trpc/client';

export const SEARCH_PARAM_VERIFY_EMAIL = 'delete-account';

export const AccountDeleteVerificationCodeModale = () => {
  const { t } = useTranslation(['account']);
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsUpdater = useSearchParamsUpdater();
  const verifyEmail = searchParams.get(SEARCH_PARAM_VERIFY_EMAIL);
  const token = searchParams.get('token');

  const onClose = () => {
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
  const updateEmailValidate = trpc.account.deleteValidate.useMutation({
    onSuccess: async () => {
      router.replace('/');
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
              confirmText={t('account:deleteAccount.validate.button')}
              confirmVariant="@dangerPrimary"
              autoSubmit={false}
            />
          </Formiz>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
