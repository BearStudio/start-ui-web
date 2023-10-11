import React from 'react';

import { Box, Button, Card, CardBody, CardHeader } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu';

import { Logo } from '@/components/Logo';
import { SlideIn } from '@/components/SlideIn';
import { APP_PATH } from '@/features/app/constants';
import {
  VerificationCodeForm,
  useOnVerificationCodeError,
} from '@/features/auth/VerificationCodeForm';
import { useRtl } from '@/hooks/useRtl';
import { trpc } from '@/lib/trpc/client';

export default function PageLoginValidate() {
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

  const validate = trpc.auth.loginValidate.useMutation({
    onSuccess: () => {
      // Optimistic Update
      trpcContext.auth.checkAuthenticated.setData(undefined, {
        isAuthenticated: true,
      });

      router.push(searchParams.get('redirect') || APP_PATH || '/');
    },
    onError: onVerificationCodeError,
  });

  return (
    <SlideIn>
      <Box px="2" py="4rem" w="22rem" maxW="full" m="auto">
        <Logo h="3rem" mb="8" mx="auto" />
        <Card>
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
            <Formiz connect={form} autoForm>
              <VerificationCodeForm
                email={email ?? ''}
                isLoading={validate.isLoading}
              />
            </Formiz>
          </CardBody>
        </Card>
      </Box>
    </SlideIn>
  );
}
