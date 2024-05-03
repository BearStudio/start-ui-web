import React from 'react';

import { Stack } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormField } from '@/components/Form';
import { FormFieldsRepository } from '@/features/repositories/schemas';

export const RepositoryForm = () => {
  const { t } = useTranslation(['common', 'repositories']);
  const form = useFormContext<FormFieldsRepository>();

  return (
    <Stack spacing={4}>
      <FormField
        control={form.control}
        type="text"
        name="name"
        label={t('repositories:data.name.label')}
      />
      <FormField
        control={form.control}
        type="text"
        name="link"
        label={t('repositories:data.link.label')}
      />
      <FormField
        control={form.control}
        type="textarea"
        name="description"
        label={t('repositories:data.description.label')}
        optionalityHint="optional"
        rows={6}
      />
    </Stack>
  );
};
