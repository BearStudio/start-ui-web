import React from 'react';

import { Button, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu';

import { ADMIN_PATH } from '@/features/admin/constants';
import {
  VerificationCodeForm,
  useOnVerificationCodeError,
} from '@/features/auth/VerificationCodeForm';
import { useRtl } from '@/hooks/useRtl';
import { trpc } from '@/lib/trpc/client';

export default function PageRegisterValidate() {
  const { t } = useTranslation(['common']);
  const { rtlValue } = useRtl();
  const router = useRouter();
  const params = useParams();
  const trpcContext = trpc.useContext();
  const searchParams = useSearchParams();

  const token = params?.token?.toString() ?? '';
  const email = searchParams.get('email');

  const form = useForm<{ code: string }>({
    onValidSubmit: (values) => validate.mutate({ ...values, token }),
  });

  const onVerificationCodeError = useOnVerificationCodeError({ form });

  const validate = trpc.auth.registerValidate.useMutation({
    onSuccess: () => {
      // Optimistic Update
      trpcContext.auth.checkAuthenticated.setData(undefined, {
        isAuthenticated: true,
      });

      router.replace(ADMIN_PATH || '/');
    },
    onError: onVerificationCodeError,
  });

  return (
    <Stack spacing={6}>
      <Button
        me="auto"
        size="sm"
        leftIcon={rtlValue(<LuArrowLeft />, <LuArrowRight />)}
        onClick={() => router.back()}
      >
        {t('common:actions.back')}
      </Button>

      <Formiz connect={form} autoForm>
        <VerificationCodeForm
          email={email ?? ''}
          isLoading={validate.isLoading}
        />
      </Formiz>
    </Stack>
  );
}
