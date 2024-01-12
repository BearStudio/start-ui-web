import React from 'react';

import { Stack } from '@chakra-ui/react';
import { isEmail } from '@formiz/validations';
import { useTranslation } from 'react-i18next';

import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import {
  USER_AUTHORIZATIONS,
  UserAuthorization,
} from '@/features/users/schemas';
import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE_KEY,
} from '@/lib/i18n/constants';

export type UserFormFields = {
  name: string;
  email: string;
  language: string;
  authorizations: UserAuthorization[];
};

export const UserForm = () => {
  const { t } = useTranslation(['common', 'users']);

  return (
    <Stack spacing={4}>
      <FieldInput
        name="name"
        required={t('users:data.name.required')}
        label={t('users:data.name.label')}
      />
      <FieldInput
        name="email"
        label={t('users:data.email.label')}
        required={t('users:data.email.required')}
        validations={[
          {
            handler: isEmail(),
            message: t('users:data.email.invalid'),
          },
        ]}
      />
      <FieldSelect
        name="language"
        label={t('users:data.language.label')}
        options={AVAILABLE_LANGUAGES.map(({ key }) => ({
          label: t(`common:languages.${key}`),
          value: key,
        }))}
        defaultValue={DEFAULT_LANGUAGE_KEY}
      />
      <FieldSelect
        name="authorizations"
        label={t('users:data.authorizations.label')}
        required={t('users:data.authorizations.required')}
        options={USER_AUTHORIZATIONS.map((authorization) => ({
          value: authorization,
          label: t(`users:data.authorizations.options.${authorization}`),
        }))}
        isMulti
        defaultValue={['APP']}
      />
    </Stack>
  );
};
