import React from 'react';

import { Stack } from '@chakra-ui/react';
import {
  isEmail,
  isMaxLength,
  isMinLength,
  isPattern,
} from '@formiz/validations';
import { useTranslation } from 'react-i18next';

import { FieldCheckboxes, FieldInput, FieldSelect } from '@/components';
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from '@/constants/i18n';
import { useDarkMode } from '@/hooks/useDarkMode';

const AUTHORITIES = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
};

export const UserForm = () => {
  const { t } = useTranslation();
  const { colorModeValue } = useDarkMode();
  const authorities = Object.values(AUTHORITIES).map((value) => ({ value }));
  return (
    <Stack
      direction="column"
      bg={colorModeValue('white', 'gray.900')}
      p="6"
      borderRadius="lg"
      spacing="6"
      shadow="md"
    >
      <FieldInput
        name="login"
        label={t('users:data.login.label')}
        required={t('users:data.login.required') as string}
        validations={[
          {
            rule: isMinLength(2),
            message: t('users:data.login.tooShort', { min: 2 }),
          },
          {
            rule: isMaxLength(50),
            message: t('users:data.login.tooLong', { max: 50 }),
          },
          {
            rule: isPattern(
              '^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$'
            ),
            message: t('users:data.login.invalid'),
          },
        ]}
      />
      <Stack direction={{ base: 'column', sm: 'row' }} spacing="6">
        <FieldInput name="firstName" label={t('users:data.firstname.label')} />
        <FieldInput name="lastName" label={t('users:data.lastname.label')} />
      </Stack>
      <FieldInput
        name="email"
        label={t('users:data.email.label')}
        required={t('users:data.email.required') as string}
        validations={[
          {
            rule: isMinLength(5),
            message: t('users:data.email.tooShort', { min: 5 }),
          },
          {
            rule: isMaxLength(254),
            message: t('users:data.email.tooLong', { min: 254 }),
          },
          {
            rule: isEmail(),
            message: t('users:data.email.invalid'),
          },
        ]}
      />
      <FieldSelect
        name="langKey"
        label={t('users:data.language.label')}
        options={AVAILABLE_LANGUAGES.map((langKey) => ({
          label: t(`languages.${langKey}`),
          value: langKey,
        }))}
        defaultValue={DEFAULT_LANGUAGE}
      />
      <FieldCheckboxes
        name="authorities"
        label={t('users:data.authorities.label')}
        options={authorities}
        required={t('users:data.authorities.required') as string}
      />
    </Stack>
  );
};
