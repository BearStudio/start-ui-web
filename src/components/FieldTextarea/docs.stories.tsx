import React from 'react';

import { Box, Button, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';

import { FieldTextarea } from './index';

export default {
  title: 'Fields/FieldTextarea',
};

export const Default = () => {
  const form = useForm({ onSubmit: console.log });
  return (
    <Formiz connect={form} autoForm>
      <Stack spacing={4}>
        <FieldTextarea
          name="demo-description"
          label="Description"
          helper="Please give a description to your project"
          required="Description is required"
          componentProps={{ placeholder: 'Placeholder' }}
        />
        <FieldTextarea
          name="demo-read-only"
          label="Read Only"
          defaultValue="Value"
          helper="This is an helper"
          isReadOnly
          componentProps={{ placeholder: 'Placeholder' }}
        />
        <FieldTextarea
          name="demo-disabled"
          label="Disabled"
          defaultValue="Value"
          helper="This is an helper"
          isDisabled
          componentProps={{ placeholder: 'Placeholder' }}
        />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};

export const TextareaProps = () => {
  const form = useForm({ onSubmit: console.log });
  return (
    <Formiz connect={form} autoForm>
      <Stack spacing={4}>
        <FieldTextarea
          name="demo-description"
          label="Resize is horizontal"
          helper="Please give a description to your project"
          required="Description is required"
          componentProps={{
            resize: 'horizontal',
            placeholder: 'Placeholder',
          }}
        />
        <FieldTextarea
          name="demo-description"
          label="Resize is none"
          helper="Please give a description to your project"
          componentProps={{
            resize: 'none',
            placeholder: 'Placeholder',
          }}
        />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};
