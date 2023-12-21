import React from 'react';

import { Box, Button, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { Meta } from '@storybook/react';

import { FieldUploadPreview } from '@/components/FieldUpload/FieldUploadPreview';
import { useFieldUploadFileFromUrl } from '@/components/FieldUpload/utils';

import { FieldUpload } from '.';

export default {
  title: 'Fields/FieldUpload',
} satisfies Meta;

export const Default = () => {
  const form = useForm({ onSubmit: console.log });
  return (
    <Formiz connect={form} autoForm>
      <Stack spacing={4}>
        <FieldUpload name="file" label="File" />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};

export const DefaultValue = () => {
  const initialFiles = useFieldUploadFileFromUrl(
    'https://plus.unsplash.com/premium_photo-1674593231084-d8b27596b134?auto=format&fit=crop&q=60&w=800&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyfHx8ZW58MHx8fHx8'
  );

  const form = useForm({
    ready: initialFiles.isSuccess,
    initialValues: {
      file: initialFiles.data,
    },
    onSubmit: console.log,
  });

  return (
    <Formiz connect={form} autoForm>
      <Stack spacing={4}>
        <FieldUpload name="file" label="File" />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};

export const WithPreview = () => {
  const initialFiles = useFieldUploadFileFromUrl(
    'https://plus.unsplash.com/premium_photo-1674593231084-d8b27596b134?auto=format&fit=crop&q=60&w=800&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyfHx8ZW58MHx8fHx8'
  );

  const form = useForm({
    ready: initialFiles.isSuccess,
    initialValues: {
      file: initialFiles.data,
    },
    onSubmit: console.log,
  });

  return (
    <Formiz connect={form} autoForm>
      <Stack spacing={4}>
        <FieldUpload name="file" label="File" />
        <FieldUploadPreview uploaderName="file" />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};
