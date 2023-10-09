import React, { useState } from 'react';

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Stack,
  Text,
  chakra,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { FieldPinInput } from '@/components/FieldPinInput';
import { Logo } from '@/components/Logo';
import { SlideIn } from '@/components/SlideIn';
import {
  VALIDATION_TOKEN_EXPIRATION_IN_MINUTES,
  getRetryDelayInSeconds,
} from '@/features/auth/utils';
import { DevCodeHint } from '@/features/dev/DevCodeHint';
import { useSearchParamsUpdater } from '@/hooks/useSearchParamsUpdater';
import { trpc } from '@/lib/trpc/client';

export default function PageLoginValidate() {
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

        form.setErrors({
          code: `Code is invalid, please wait ${seconds} seconds before submitting`,
        });

        searchParamsUpdater(
          {
            retries: (retries + 1).toString(),
          },
          { replace: true }
        );

        await new Promise((r) => {
          setTimeout(r, seconds * 1_000);
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
            <Stack>
              <Heading size="md" data-test="login-page-heading">
                {t('auth:login.code.title')}
              </Heading>
              <Text>
                We&apos;ve sent a 6-character code to{' '}
                <chakra.strong>{email}</chakra.strong>. The code expires shortly
                ({VALIDATION_TOKEN_EXPIRATION_IN_MINUTES} minutes), so please
                enter it soon.
              </Text>
            </Stack>
          </CardHeader>
          <CardBody>
            <Formiz connect={form} autoForm>
              <Stack spacing="4">
                <FieldPinInput
                  name="code"
                  label="Code"
                  helper="Can't find the code? Check your spams."
                  autoFocus
                  onComplete={() => {
                    if (validate.isLoading) {
                      // We don't want to submit if the previous request is
                      // still loading.
                      return;
                    }

                    form.submit();
                  }}
                />
                <Flex>
                  <Button type="button" onClick={() => router.back()}>
                    Back
                  </Button>
                  <Button
                    isLoading={validate.isLoading}
                    isDisabled={form.isSubmitted && !form.isValid}
                    type="submit"
                    variant="@primary"
                    ms="auto"
                  >
                    {t('auth:login.actions.login')}
                  </Button>
                </Flex>

                <DevCodeHint />
              </Stack>
            </Formiz>
          </CardBody>
        </Card>
      </Box>
    </SlideIn>
  );
}
