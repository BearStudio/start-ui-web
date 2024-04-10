import React from 'react';

import { Stack } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormField } from '@/components/Form';
import { FormFieldUser, USER_AUTHORIZATIONS } from '@/features/users/schemas';
import { AVAILABLE_LANGUAGES } from '@/lib/i18n/constants';

export const UserForm = () => {
  const { t } = useTranslation(['common', 'users']);
  const form = useFormContext<FormFieldUser>();

  return (
    <Stack spacing={4}>
      <FormField
        control={form.control}
        type="text"
        name="name"
        label={t('users:data.name.label')}
      />
      <FormField
        control={form.control}
        type="email"
        name="email"
        label={t('users:data.email.label')}
      />
      <FormField
        control={form.control}
        type="select"
        name="language"
        label={t('users:data.language.label')}
        options={AVAILABLE_LANGUAGES.map(({ key }) => ({
          label: t(`common:languages.${key}`),
          value: key,
        }))}
      />
      <FormField
        control={form.control}
        type="multi-select"
        name="authorizations"
        label={t('users:data.authorizations.label')}
        options={USER_AUTHORIZATIONS.map((authorization) => ({
          value: authorization,
          label: t(`users:data.authorizations.options.${authorization}`),
        }))}
      />
    </Stack>
  );
};
