import { Button, Stack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu';

import { Form } from '@/components/Form';
import { ROUTES_ADMIN } from '@/features/admin/routes';
import { ROUTES_APP } from '@/features/app/routes';
import {
  VerificationCodeForm,
  useOnVerificationCodeError,
} from '@/features/auth/VerificationCodeForm';
import {
  FormFieldsVerificationCode,
  zFormFieldsVerificationCode,
} from '@/features/auth/schemas';
import { useRtl } from '@/hooks/useRtl';
import { trpc } from '@/lib/trpc/client';

export default function PageLoginValidate() {
  const { t } = useTranslation(['common']);
  const { rtlValue } = useRtl();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const trpcUtils = trpc.useUtils();
  const queryCache = useQueryClient();

  const token = params?.token?.toString() ?? '';
  const email = searchParams.get('email');

  const form = useForm<FormFieldsVerificationCode>({
    mode: 'onBlur',
    resolver: zodResolver(zFormFieldsVerificationCode()),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit: SubmitHandler<FormFieldsVerificationCode> = (values) => {
    validate.mutate({ ...values, token });
  };

  const onVerificationCodeError = useOnVerificationCodeError({
    onError: (error) =>
      form.setError('code', {
        message: error,
      }),
  });

  const validate = trpc.auth.loginValidate.useMutation({
    onSuccess: (data) => {
      queryCache.clear();

      // Optimistic Update
      trpcUtils.auth.checkAuthenticated.setData(undefined, {
        isAuthenticated: true,
      });

      if (redirect) {
        router.replace(redirect);
        return;
      }

      if (data.account.authorizations.includes('ADMIN')) {
        router.replace(ROUTES_ADMIN.root());
        return;
      }

      router.replace(ROUTES_APP.root());
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

      <Form {...form} onSubmit={onSubmit}>
        <VerificationCodeForm
          email={email ?? ''}
          isLoading={validate.isLoading || validate.isSuccess}
        />
      </Form>
    </Stack>
  );
}
