import React from 'react';

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Form } from '@/components/Form';
import {
  VerificationCodeForm,
  useOnVerificationCodeError,
} from '@/features/auth/VerificationCodeForm';
import { trpc } from '@/lib/trpc/client';

import {
  FormFieldsVerificationCode,
  zFormFieldsVerificationCode,
} from '../auth/schemas';

export const SEARCH_PARAM_VERIFY_EMAIL = 'delete-account';

export const AccountDeleteVerificationCodeModale = () => {
  const { t } = useTranslation(['account']);
  const router = useRouter();
  const [searchParams, setSearchParams] = useQueryStates(
    {
      [SEARCH_PARAM_VERIFY_EMAIL]: parseAsString,
      token: parseAsString,
      attempts: parseAsInteger,
    },
    {
      history: 'replace',
    }
  );

  const onClose = () => {
    setSearchParams({
      [SEARCH_PARAM_VERIFY_EMAIL]: null,
      token: null,
      attempts: null,
    });
  };

  const form = useForm<{ code: string }>({
    mode: 'onBlur',
    resolver: zodResolver(zFormFieldsVerificationCode()),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit: SubmitHandler<FormFieldsVerificationCode> = (values) => {
    updateEmailValidate.mutate({ ...values, token: searchParams.token ?? '' });
  };

  const onVerificationCodeError = useOnVerificationCodeError({
    onError: (error) =>
      form.setError('code', {
        message: error,
      }),
  });

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
          <Form {...form} onSubmit={onSubmit}>
            <VerificationCodeForm
              email={searchParams[SEARCH_PARAM_VERIFY_EMAIL] ?? ''}
              isLoading={updateEmailValidate.isLoading}
              confirmText={t('account:deleteAccount.validate.button')}
              confirmVariant="@dangerPrimary"
              autoSubmit={false}
            />
          </Form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
