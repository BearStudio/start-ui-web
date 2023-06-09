import React from 'react';

import { Stack } from '@chakra-ui/react';
import { isMinLength } from '@formiz/validations';
import { useTranslation } from 'react-i18next';

import { FieldInput } from '@/components/FieldInput';
import { FieldTextarea } from '@/components/FieldTextarea';

export const RepositoryForm = () => {
  const { t } = useTranslation(['common', 'repositories']);

  return (
    <Stack
      direction="column"
      borderRadius="lg"
      spacing="6"
      shadow="md"
      bg="white"
      _dark={{ bg: 'gray.900' }}
      p="6"
    >
      <FieldInput
        name="name"
        label={t('repositories:data.name.label')}
        required={t('repositories:data.name.required') as string}
        validations={[
          {
            handler: isMinLength(5),
            message: t('repositories:data.name.tooShort', { min: 5 }),
          },
        ]}
      />
      <FieldInput
        name="link"
        required={t('repositories:data.link.required') as string}
        label={t('repositories:data.link.label')}
      />
      <FieldTextarea
        name="description"
        label={t('repositories:data.description.label')}
      />
    </Stack>
  );
};
