import React from 'react';

import { Button, Card, CardBody, CardHeader } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu';

import { Form } from '@/components/Form';
import { ROUTES_ADMIN } from '@/features/admin/routes';
import {
  VerificationCodeForm,
  useOnVerificationCodeError,
  useOnVerificationCodeSuccess,
} from '@/features/auth/VerificationCodeForm';
import {
  FormFieldsVerificationCode,
  zFormFieldsVerificationCode,
} from '@/features/auth/schemas';
import { useRtl } from '@/hooks/useRtl';
import { trpc } from '@/lib/trpc/client';

export default function PageAdminLoginValidate() {
  const { t } = useTranslation(['common']);
  const { rtlValue } = useRtl();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

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

  const onVerificationCodeSuccess = useOnVerificationCodeSuccess({
    defaultRedirect: ROUTES_ADMIN.root(),
  });
  const onVerificationCodeError = useOnVerificationCodeError({
    onError: (error) => form.setError('code', { message: error }),
  });

  const validate = trpc.auth.loginValidate.useMutation({
    onSuccess: onVerificationCodeSuccess,
    onError: onVerificationCodeError,
  });

  return (
    <Card boxShadow="card">
      <CardHeader pb={0}>
        <Button
          me="auto"
          size="sm"
          leftIcon={rtlValue(<LuArrowLeft />, <LuArrowRight />)}
          onClick={() => router.back()}
        >
          {t('common:actions.back')}
        </Button>
      </CardHeader>
      <CardBody>
        <Form {...form} onSubmit={onSubmit}>
          <VerificationCodeForm
            email={email ?? ''}
            isLoading={validate.isLoading || validate.isSuccess}
          />
        </Form>
      </CardBody>
    </Card>
  );
}
