import React, { useEffect } from 'react';

import { Box, Button, Flex, Heading, Stack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/Form';
import { useToastError } from '@/components/Toast';
import { ROUTES_AUTH } from '@/features/auth/routes';
import {
  FormFieldsRegister,
  zFormFieldsRegister,
} from '@/features/auth/schemas';
import { DemoRegisterHint } from '@/features/demo-mode/DemoRegisterHint';
import { AVAILABLE_LANGUAGES } from '@/lib/i18n/constants';
import { trpc } from '@/lib/trpc/client';

export default function PageRegister() {
  const { t, i18n } = useTranslation(['common', 'auth']);

  const toastError = useToastError();
  const router = useRouter();

  const register = trpc.auth.register.useMutation({
    onSuccess: (data, variables) => {
      router.push(
        ROUTES_AUTH.app.registerValidate({
          token: data.token,
          email: variables.email,
        })
      );
    },
    onError: () => {
      toastError({
        title: t('auth:register.feedbacks.registrationError.title'),
      });
    },
  });

  const form = useForm<FormFieldsRegister>({
    resolver: zodResolver(zFormFieldsRegister()),
    defaultValues: {
      name: '',
      email: '',
      language: i18n.language,
    },
  });

  const language = form.watch('language');

  // Change language based on form
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [i18n, language]);

  return (
    <Stack spacing={6}>
      <Stack spacing={1}>
        <Heading size="md">{t('auth:register.title')}</Heading>
        <Button
          as={Link}
          href={ROUTES_AUTH.app.login()}
          variant="link"
          size="sm"
          whiteSpace="normal"
          display="inline"
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

      <Form
        {...form}
        onSubmit={(values) => {
          register.mutate(values);
        }}
      >
        <Stack spacing="4">
          <FormField>
            <FormFieldLabel>{t('auth:data.language.label')}</FormFieldLabel>
            <FormFieldController
              control={form.control}
              type="select"
              name="language"
              options={AVAILABLE_LANGUAGES.map(({ key }) => ({
                label: t(`common:languages.${key}`),
                value: key,
              }))}
            />
          </FormField>

          <FormField>
            <FormFieldLabel>{t('auth:data.name.label')}</FormFieldLabel>
            <FormFieldController
              control={form.control}
              type="text"
              name="name"
            />
          </FormField>

          <FormField>
            <FormFieldLabel>{t('auth:data.email.label')}</FormFieldLabel>
            <FormFieldController
              control={form.control}
              type="email"
              name="email"
            />
          </FormField>

          <Flex>
            <Button
              isLoading={register.isLoading}
              type="submit"
              variant="@primary"
              flex={1}
              size="lg"
            >
              {t('auth:register.actions.create')}
            </Button>
          </Flex>
          <DemoRegisterHint loginPath={ROUTES_AUTH.app.login()} />
        </Stack>
      </Form>
    </Stack>
  );
}
