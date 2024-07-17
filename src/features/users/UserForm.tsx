import React from 'react';

import { Stack } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/Form';
import { FormFieldUser, USER_AUTHORIZATIONS } from '@/features/users/schemas';
import { AVAILABLE_LANGUAGES } from '@/lib/i18n/constants';

export const UserForm = () => {
  const { t } = useTranslation(['common', 'users']);
  const form = useFormContext<FormFieldUser>();

  return (
    <Stack spacing={4}>
      <FormField>
        <FormFieldLabel>{t('users:data.name.label')}</FormFieldLabel>
        <FormFieldController control={form.control} type="text" name="name" />
      </FormField>
      <FormField>
        <FormFieldLabel>{t('users:data.email.label')}</FormFieldLabel>
        <FormFieldController control={form.control} type="email" name="email" />
      </FormField>
      <FormField>
        <FormFieldLabel>{t('users:data.language.label')}</FormFieldLabel>
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
        <FormFieldLabel>{t('users:data.authorizations.label')}</FormFieldLabel>
        <FormFieldController
          control={form.control}
          type="multi-select"
          name="authorizations"
          options={USER_AUTHORIZATIONS.map((authorization) => ({
            value: authorization,
            label: t(`users:data.authorizations.options.${authorization}`),
          }))}
        />
      </FormField>
    </Stack>
  );
};
