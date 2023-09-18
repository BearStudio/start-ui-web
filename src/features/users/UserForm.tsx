import React from 'react';

import { Card, CardBody, Stack } from '@chakra-ui/react';
import { isEmail } from '@formiz/validations';
import { useTranslation } from 'react-i18next';

import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE_KEY,
} from '@/lib/i18n/constants';

export type UserFormFields = {
  name: string;
  email: string;
  language: string;
  role: 'USER' | 'ADMIN';
};

export const UserForm = () => {
  const { t } = useTranslation(['common', 'users']);

  return (
    <Card>
      <CardBody>
        <Stack spacing={4}>
          <FieldInput
            name="name"
            required="Name is required" // TODO translation
            label="Name" // TODO translation
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
            name="role"
            label="Role" // TODO translation
            options={[
              { value: 'USER', label: 'User' }, // TODO translation
              { value: 'ADMIN', label: 'Admin' }, // TODO translation
            ]}
            defaultValue="USER"
          />
        </Stack>
      </CardBody>
    </Card>
  );
};
