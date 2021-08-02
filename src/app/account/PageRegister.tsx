import React, { useState, useEffect } from 'react';

import {
  Alert,
  AlertTitle,
  AlertDescription,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Stack,
  ScaleFade,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import {
  isEmail,
  isMaxLength,
  isMinLength,
  isPattern,
} from '@formiz/validations';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

import { useCreateAccount } from '@/app/account/account.service';
import { FieldInput, FieldSelect, SlideIn, useToastError } from '@/components';
import { AVAILABLE_LANGUAGES } from '@/constants/i18n';
import { useDarkMode } from '@/hooks/useDarkMode';

export const PageRegister = () => {
  const { t, i18n } = useTranslation();
  const { colorModeValue } = useDarkMode();
  const form = useForm({
    subscribe: { form: true, fields: ['langKey'] },
  });
  const toastError = useToastError();
  const [accountEmail, setAccountEmail] = useState('');

  // Change language based on form
  useEffect(() => {
    i18n.changeLanguage(form.values?.langKey);
  }, [i18n, form.values?.langKey]);

  const { mutate: createUser, isLoading, isSuccess } = useCreateAccount({
    onMutate: ({ email }) => {
      setAccountEmail(email);
    },
    onError: (error: any) => {
      const { errorKey, title } = error?.response?.data || {};

      toastError({
        title: t('account:register.feedbacks.registrationError.title'),
        description: title,
      });

      if (errorKey === 'userexists') {
        form.invalidateFields({
          login: t('account:data.login.alreadyUsed'),
        });
      }

      if (errorKey === 'emailexists') {
        form.invalidateFields({ email: t('account:data.email.alreadyUsed') });
      }
    },
  });

  if (isSuccess) {
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
              as={RouterLink}
              to="/login"
              variant="link"
              color={colorModeValue('brand.500', 'brand.300')}
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
        <Formiz
          id="register-form"
          autoForm
          onValidSubmit={createUser}
          connect={form}
        >
          <Box
            p="6"
            bg={colorModeValue('white', 'blackAlpha.400')}
            borderRadius="md"
            boxShadow="md"
          >
            <Heading size="lg" mb="4">
              {t('account:register.title')}
            </Heading>
            <Stack spacing="4">
              <FieldSelect
                name="langKey"
                label={t('account:data.language.label')}
                options={AVAILABLE_LANGUAGES.map((langKey) => ({
                  label: t(`languages.${langKey}`),
                  value: langKey,
                }))}
                defaultValue={i18n.language}
              />
              <FieldInput
                name="login"
                label={t('account:data.login.label')}
                required={t('account:data.login.required') as string}
                validations={[
                  {
                    rule: isMinLength(2),
                    message: t('account:data.login.tooShort', { min: 2 }),
                  },
                  {
                    rule: isMaxLength(50),
                    message: t('account:data.login.tooLong', { max: 50 }),
                  },
                  {
                    rule: isPattern(
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
                    rule: isMinLength(5),
                    message: t('account:data.email.tooShort', { min: 5 }),
                  },
                  {
                    rule: isMaxLength(254),
                    message: t('account:data.email.tooLong', { min: 254 }),
                  },
                  {
                    rule: isEmail(),
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
                    rule: isMinLength(4),
                    message: t('account:data.password.tooShort', { min: 4 }),
                  },
                  {
                    rule: isMaxLength(50),
                    message: t('account:data.password.tooLong', { min: 50 }),
                  },
                ]}
              />
              <Flex>
                <Button
                  isLoading={isLoading}
                  isDisabled={form.isSubmitted && !form.isValid}
                  type="submit"
                  variant="@primary"
                  ms="auto"
                >
                  {t('account:register.actions.create')}
                </Button>
              </Flex>
            </Stack>
          </Box>
          <Center mt="8">
            <Button as={RouterLink} to="/login" variant="link">
              {t('account:register.actions.alreadyHaveAnAccount')}{' '}
              <Box
                as="strong"
                color={colorModeValue('brand.500', 'brand.300')}
                ms="2"
              >
                {t('account:register.actions.login')}
              </Box>
            </Button>
          </Center>
        </Formiz>
      </Box>
    </SlideIn>
  );
};
