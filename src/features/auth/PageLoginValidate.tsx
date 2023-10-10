import React from 'react';

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  HStack,
  Heading,
  Stack,
  Text,
  chakra,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu';

import { FieldPinInput } from '@/components/FieldPinInput';
import { Logo } from '@/components/Logo';
import { SlideIn } from '@/components/SlideIn';
import {
  VALIDATION_TOKEN_EXPIRATION_IN_MINUTES,
  getRetryDelayInSeconds,
} from '@/features/auth/utils';
import { DevCodeHint } from '@/features/dev/DevCodeHint';
import { useRtl } from '@/hooks/useRtl';
import { useSearchParamsUpdater } from '@/hooks/useSearchParamsUpdater';
import { trpc } from '@/lib/trpc/client';

export default function PageLoginValidate() {
  const { rtlValue } = useRtl();
  const { t } = useTranslation(['auth']);
  const router = useRouter();
  const params = useParams();
  const trpcContext = trpc.useContext();
  const searchParams = useSearchParams();
  const searchParamsUpdater = useSearchParamsUpdater();

  const token = params?.token?.toString() ?? '';
  const email = searchParams.get('email');

  const form = useForm<{ code: string }>({
    onValidSubmit: (values) => validate.mutate({ ...values, token }),
  });

  const validate = trpc.auth.loginValidate.useMutation({
    onSuccess: () => {
      // Optimistic Update
      trpcContext.auth.checkAuthenticated.setData(undefined, true);

      // TODO setup redirect logic (redirect url params)
      router.push('/dashboard');
    },
    onError: async (error) => {
      if (error.data?.code === 'UNAUTHORIZED') {
        const retries = parseInt(searchParams.get('retries') ?? '0', 10);
        const seconds = getRetryDelayInSeconds(retries);

        searchParamsUpdater(
          {
            retries: (retries + 1).toString(),
          },
          { replace: true }
        );

        await new Promise((r) => {
          setTimeout(r, seconds * 1_000);
        });

        form.setErrors({
          code: `Code is invalid`,
        });

        return;
      }

      if (error.data?.code === 'BAD_REQUEST') {
        form.setErrors({ code: 'Code should be 6 digits' });
        return;
      }

      form.setErrors({ code: 'Unkown error' });
    },
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
              Back
            </Button>
          </CardHeader>
          <CardBody>
            <Formiz connect={form} autoForm>
              <Stack spacing="4">
                <Stack>
                  <Heading size="md" data-test="login-page-heading">
                    {t('auth:login.code.title')}
                  </Heading>
                  <Text fontSize="sm">
                    We&apos;ve sent a 6-character code to{' '}
                    <chakra.strong>{email}</chakra.strong>. The code expires
                    shortly ({VALIDATION_TOKEN_EXPIRATION_IN_MINUTES} minutes),
                    so please enter it soon.
                  </Text>
                </Stack>
                <FieldPinInput
                  name="code"
                  label="Verification code"
                  helper="Can't find the code? Check your spams."
                  autoFocus
                  isDisabled={validate.isLoading}
                  onComplete={() => {
                    // Only auto submit on first try
                    if (!form.isSubmitted) {
                      form.submit();
                    }
                  }}
                />
                <HStack spacing={8}>
                  <Button
                    size="lg"
                    isLoading={validate.isLoading}
                    isDisabled={form.isSubmitted && !form.isValid}
                    type="submit"
                    variant="@primary"
                    flex={1}
                  >
                    Confirm
                  </Button>
                </HStack>

                <DevCodeHint />
              </Stack>
            </Formiz>
          </CardBody>
        </Card>
      </Box>
    </SlideIn>
  );
}
