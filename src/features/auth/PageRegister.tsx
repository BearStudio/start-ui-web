import React, { useEffect } from 'react';

import { Box, Button, Flex, Heading, Stack } from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import { isEmail } from '@formiz/validations';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { useToastError } from '@/components/Toast';
import { LinkApp } from '@/features/app/LinkApp';
import { APP_PATH } from '@/features/app/constants';
import { DemoRegisterHint } from '@/features/demo-mode/DemoRegisterHint';
import { AVAILABLE_LANGUAGES, Language } from '@/lib/i18n/constants';
import { trpc } from '@/lib/trpc/client';

export default function PageRegister() {
  const { t, i18n } = useTranslation(['common', 'auth']);

  const toastError = useToastError();
  const router = useRouter();

  const register = trpc.auth.register.useMutation({
    onSuccess: (data, variables) => {
      router.push(
        `${APP_PATH}/register/${data.token}?email=${variables.email}`
      );
    },
    onError: () => {
      toastError({
        title: t('auth:register.feedbacks.registrationError.title'),
      });
    },
  });

  const form = useForm<{
    language: string;
    name: string;
    email: string;
  }>({
    onValidSubmit: (values) => register.mutate(values),
  });

  const values = useFormFields({
    connect: form,
    fields: ['language'] as const,
    selector: (field) => field.value,
  });

  // Change language based on form
  useEffect(() => {
    i18n.changeLanguage(values?.language);
  }, [i18n, values?.language]);

  return (
    <Stack spacing={6}>
      <Stack spacing={1}>
        <Heading size="md">{t('auth:register.title')}</Heading>
        <Button
          as={LinkApp}
          href="/login"
          variant="link"
          size="sm"
          whiteSpace="normal"
          display="inline"
          textAlign="left"
          fontWeight="normal"
          px="0"
          color="text-dimmed"
        >
          {t('auth:register.actions.alreadyHaveAnAccount')}{' '}
          <Box
            as="strong"
            ms="1"
            color="brand.500"
            _dark={{ color: 'brand.300' }}
          >
            {t('auth:register.actions.login')}
          </Box>
        </Button>
      </Stack>

      <Formiz connect={form} autoForm>
        <Stack spacing="4">
          <FieldSelect
            name="language"
            label={t('auth:data.language.label')}
            options={AVAILABLE_LANGUAGES.map(({ key }) => ({
              label: t(`common:languages.${key}`),
              value: key,
            }))}
            defaultValue={i18n.language as Language['key']}
          />
          <FieldInput
            name="name"
            label={t('auth:data.name.label')}
            required={t('auth:data.name.required')}
          />
          <FieldInput
            name="email"
            label={t('auth:data.email.label')}
            required={t('auth:data.email.required')}
            validations={[
              {
                handler: isEmail(),
                message: t('auth:data.email.invalid'),
              },
            ]}
          />
          <Flex>
            <Button
              isLoading={register.isLoading}
              isDisabled={form.isSubmitted && !form.isValid}
              type="submit"
              variant="@primary"
              flex={1}
              size="lg"
            >
              {t('auth:register.actions.create')}
            </Button>
          </Flex>
          <DemoRegisterHint loginPath={`${APP_PATH}/login`} />
        </Stack>
      </Formiz>
    </Stack>
  );
}
