import React, { useEffect, useState } from 'react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  ScaleFade,
  Stack,
} from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import {
  isEmail,
  isMaxLength,
  isMinLength,
  isPattern,
} from '@formiz/validations';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { SlideIn } from '@/components/SlideIn';
import { useToastError } from '@/components/Toast';
import { useCreateAccount } from '@/features/account/service';
import { DemoRegisterHint } from '@/features/demo-mode/DemoRegisterHint';
import { User } from '@/features/users/schema';
import { AVAILABLE_LANGUAGES } from '@/lib/i18n/constants';
import { Language } from '@/lib/i18n/constants';

export default function PageRegister() {
  const { t, i18n } = useTranslation(['common', 'account']);

  const toastError = useToastError();
  const [accountEmail, setAccountEmail] = useState('');

  const createUser = useCreateAccount({
    onMutate: ({ email }) => {
      setAccountEmail(email);
    },
    onError: (error) => {
      const { errorKey, title } = error?.response?.data || {};

      toastError({
        title: t('account:register.feedbacks.registrationError.title'),
        description: title,
      });

      if (errorKey === 'userexists') {
        form.setErrors({
          login: t('account:data.login.alreadyUsed'),
        });
      }

      if (errorKey === 'emailexists') {
        form.setErrors({ email: t('account:data.email.alreadyUsed') });
      }
    },
  });

  const form = useForm<
    Pick<User, 'email' | 'login' | 'langKey'> & { password: string }
  >({
    id: 'register-form',
    onValidSubmit: (values) => createUser.mutate(values),
  });

  const values = useFormFields({
    connect: form,
    fields: ['langKey'] as const,
    selector: (field) => field.value,
  });

  // Change language based on form
  useEffect(() => {
    i18n.changeLanguage(values?.langKey);
  }, [i18n, values?.langKey]);

  if (createUser.isSuccess) {
    return (
      <Center p="4" m="auto">
        <ScaleFade initialScale={0.9} in>
          <Alert
            status="success"
            variant="solid"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            borderRadius="lg"
            px="8"
            py="4"
          >
            <Box fontSize="3rem">🎉</Box>
            <AlertTitle mt={4} mb={1} fontSize="lg">
              {t('account:register.feedbacks.registrationSuccess.title')}
            </AlertTitle>
            <AlertDescription>
              <Trans
                t={t}
                i18nKey="account:register.feedbacks.registrationSuccess.description"
                values={{ email: accountEmail }}
              />
            </AlertDescription>
          </Alert>
          <Center mt="8">
            <Button
              as={Link}
              to="/login"
              variant="link"
              color="brand.500"
              _dark={{ color: 'brand.300' }}
            >
              {t('account:register.actions.goToLogin')}
            </Button>
          </Center>
        </ScaleFade>
      </Center>
    );
  }

  return (
    <SlideIn>
      <Box p="2" pb="4rem" w="22rem" maxW="full" m="auto">
        <Formiz connect={form} autoForm>
          <Box
            p="6"
            borderRadius="md"
            boxShadow="md"
            bg="white"
            _dark={{ bg: 'blackAlpha.400' }}
          >
            <Heading size="lg" mb="4">
              {t('account:register.title')}
            </Heading>
            <Stack spacing="4">
              <FieldSelect
                name="langKey"
                label={t('account:data.language.label')}
                options={AVAILABLE_LANGUAGES.map(({ key }) => ({
                  label: t(`common:languages.${key}`),
                  value: key,
                }))}
                defaultValue={i18n.language as Language['key']}
              />
              <FieldInput
                name="login"
                label={t('account:data.login.label')}
                required={t('account:data.login.required') as string}
                validations={[
                  {
                    handler: isMinLength(2),
                    message: t('account:data.login.tooShort', { min: 2 }),
                  },
                  {
                    handler: isMaxLength(50),
                    message: t('account:data.login.tooLong', { max: 50 }),
                  },
                  {
                    handler: isPattern(
                      '^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$'
                    ),
                    message: t('account:data.login.invalid'),
                  },
                ]}
              />
              <FieldInput
                name="email"
                label={t('account:data.email.label')}
                required={t('account:data.email.required') as string}
                validations={[
                  {
                    handler: isMinLength(5),
                    message: t('account:data.email.tooShort', { min: 5 }),
                  },
                  {
                    handler: isMaxLength(254),
                    message: t('account:data.email.tooLong', { min: 254 }),
                  },
                  {
                    handler: isEmail(),
                    message: t('account:data.email.invalid'),
                  },
                ]}
              />
              <FieldInput
                name="password"
                type="password"
                label={t('account:data.password.label')}
                required={t('account:data.password.required') as string}
                validations={[
                  {
                    handler: isMinLength(4),
                    message: t('account:data.password.tooShort', { min: 4 }),
                  },
                  {
                    handler: isMaxLength(50),
                    message: t('account:data.password.tooLong', { min: 50 }),
                  },
                ]}
              />
              <Flex>
                <Button
                  isLoading={createUser.isLoading}
                  isDisabled={form.isSubmitted && !form.isValid}
                  type="submit"
                  variant="@primary"
                  ms="auto"
                >
                  {t('account:register.actions.create')}
                </Button>
              </Flex>
              <DemoRegisterHint />
            </Stack>
          </Box>
          <Center mt="8">
            <Button as={Link} to="/login" variant="link">
              {t('account:register.actions.alreadyHaveAnAccount')}{' '}
              <Box
                as="strong"
                ms="2"
                color="brand.500"
                _dark={{ color: 'brand.300' }}
              >
                {t('account:register.actions.login')}
              </Box>
            </Button>
          </Center>
        </Formiz>
      </Box>
    </SlideIn>
  );
}
